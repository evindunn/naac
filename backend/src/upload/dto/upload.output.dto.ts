import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

export class UploadOutputDto {
    @ApiProperty()
    @Expose()
    @Type(() => ObjectId)
    @Transform((id) => id.toString(), { toPlainOnly: true })
    _id: string;
}
