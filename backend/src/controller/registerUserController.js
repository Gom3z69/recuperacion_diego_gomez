import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import userModel from "../models/user.js";
import cloudinary from "../../utils/cloudinary.js";
import { config } from "../../config.js";

const registerUserController = {};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const phoneRegex = /^\+?[0-9\s-]{8,15}$/;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const codeExpirationMinutes = 15;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.email.user_email,
        pass: config.email.user_password
    }
});

registerUserController.register = async (req, res) => {
    const { nombre, apellido, email, password, telefono, fechaNacimiento } = req.body || {};

    const requiredFields = { nombre, apellido, email, password, telefono, fechaNacimiento };
    const missingFields = Object.keys(requiredFields).filter((field) => !String(requiredFields[field] || "").trim());

    if (missingFields.length > 0) {
        return res.status(400).json({message: "Faltan campos obligatorios: " + missingFields.join(", ")});
    }

    if (!req.file) {
        return res.status(400).json({message: "La fotografía de perfil es obligatoria (campo fotoPerfil)"});
    }

    if (!allowedImageTypes.includes(req.file.mimetype)) {
        return res.status(400).json({message: "La fotografía debe ser una imagen JPG, PNG o WEBP"});
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({message: "El formato del correo no es válido"});
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({message: "La contraseña debe tener al menos 8 caracteres, incluyendo letras y números"});
    }

    if (!phoneRegex.test(telefono.trim())) {
        return res.status(400).json({message: "El número de teléfono no es válido"});
    }

    const birthDate = new Date(fechaNacimiento);

    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
        return res.status(400).json({message: "La fecha de nacimiento no es válida (formato AAAA-MM-DD)"});
    }

    let uploadedImage;
    let newUser;

    try {
        const existingUser = await userModel.findOne({email: normalizedEmail});

        if (existingUser) {
            return res.status(409).json({message: "El correo ya está registrado"});
        }

        const passwordHash = await bcryptjs.hash(password, 10);

        uploadedImage = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {folder: "usuarios"}
        );

        const verificationCode = crypto.randomInt(100000, 1000000).toString();

        newUser = await userModel.create({
            nombre,
            apellido,
            email: normalizedEmail,
            password: passwordHash,
            telefono,
            fechaNacimiento: birthDate,
            fotoPerfil: uploadedImage.secure_url,
            cloudinaryPublicId: uploadedImage.public_id,
            codigoVerificacion: verificationCode,
            codigoExpira: new Date(Date.now() + codeExpirationMinutes * 60 * 1000),
            isVerified: false
        });

        await transporter.sendMail({
            from: config.email.user_email,
            to: normalizedEmail,
            subject: "Código de verificación de tu cuenta",
            html: `
                <h2>Hola ${newUser.nombre}</h2>
                <p>Tu código de verificación es:</p>
                <h1>${verificationCode}</h1>
                <p>Este código expira en ${codeExpirationMinutes} minutos.</p>
            `
        });

        res.status(201).json({
            message: "Usuario registrado, revisa tu correo para verificar la cuenta",
            user: {
                _id: newUser._id,
                nombre: newUser.nombre,
                apellido: newUser.apellido,
                email: newUser.email,
                telefono: newUser.telefono,
                fechaNacimiento: newUser.fechaNacimiento,
                fotoPerfil: newUser.fotoPerfil,
                cloudinaryPublicId: newUser.cloudinaryPublicId,
                isVerified: newUser.isVerified
            }
        });
    } catch (error) {
        if (newUser) {
            await userModel.findByIdAndDelete(newUser._id);
        }

        if (uploadedImage) {
            await cloudinary.uploader.destroy(uploadedImage.public_id);
        }

        if (error.code === 11000) {
            return res.status(409).json({message: "El correo ya está registrado"});
        }

        console.log("error " + error);
        res.status(500).json({message: "Error al registrar el usuario"});
    }
};

registerUserController.verifyCode = async (req, res) => {
    const { email, codigoVerificacion } = req.body || {};

    if (!email || !codigoVerificacion) {
        return res.status(400).json({message: "El correo y el código de verificación son obligatorios"});
    }

    try {
        const user = await userModel.findOne({email: String(email).trim().toLowerCase()});

        if (!user) {
            return res.status(404).json({message: "No existe un usuario con ese correo"});
        }

        if (user.isVerified) {
            return res.status(400).json({message: "La cuenta ya está verificada"});
        }

        if (user.codigoVerificacion !== String(codigoVerificacion).trim()) {
            return res.status(400).json({message: "El código de verificación es incorrecto"});
        }

        if (user.codigoExpira < new Date()) {
            return res.status(400).json({message: "El código de verificación ha expirado"});
        }

        user.isVerified = true;
        user.codigoVerificacion = null;
        user.codigoExpira = null;
        await user.save();

        res.status(200).json({message: "Cuenta verificada correctamente"});
    } catch (error) {
        console.log("error " + error);
        res.status(500).json({message: "Error al verificar el código"});
    }
};

export default registerUserController;