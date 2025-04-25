import { v4 as uuid } from 'uuid';

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function)=>{
    if( !file ) return callback(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];
    const originalname = file.originalname;

    const sanitizedName = originalname.replace(/[^a-zA-Z0-9-_\.]/g, '_')

    const fileName = `${uuid()}-${sanitizedName}.${fileExtension}`;

    callback(null, fileName)
}