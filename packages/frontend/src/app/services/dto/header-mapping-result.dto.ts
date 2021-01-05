import { Exclude, Expose } from "class-transformer";

@Exclude()
export class HeaderMappingResult {
    @Expose()
    institutions: string[] = [];

    @Expose()
    collections: string[] = [];
}