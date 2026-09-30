import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        nombre: {type: String},
        apellido: {type: String},
        email: {type: String},
        password: {type: String},
        telefono: {type: String},
        fechaNacimiento: {type: Date},
        fotoPerfil: {type: String},
        cloudinaryPublicId: {type: String},
        codigoVerificacion: {type: String},
        codigoExpira: {type: Date},
        isVerified: {type: Boolean}
    },{
        timestamps: true,
        strict: false
    }
);

export default model("User", userSchema, "usuarios");