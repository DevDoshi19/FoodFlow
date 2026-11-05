// for creating buffer , cause cloudinary requires buffer to upload image
import DataUriParser from "datauri/parser.js"; 
import path from 'path';

const getBuffer = (file:any) =>{
    const parser = new DataUriParser()

    const extName = path.extname(file.originalname).toString();

    return parser.format(extName, file.buffer);
};

export default getBuffer;


