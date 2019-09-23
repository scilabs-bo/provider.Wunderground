import { NormalizeError } from "../exceptions";

export class ProviderResponse {
    public entities : Normalizable[] = [];

    prepare(attributes? : string[]) {
        // Normalize all entities first
        let normalizedEntities = this.entities.map((entity) => entity.normalize(attributes));
        if(attributes === undefined)
            return normalizedEntities;
        else {
            // Reduce to id and type first
            let reducedEntities : any[] = normalizedEntities.map((entitiy) => {
                return {
                    id: entitiy.id,
                    type: entitiy.type
                };
            });
            // Append requested attributes
            for(let i = 0, attribute = attributes[i]; i < attributes.length; i++, attribute = attributes[i]) {
                for(let j = 0; j < normalizedEntities.length; j++) {
                    if(normalizedEntities[j][attribute] === undefined)
                        throw new NormalizeError(`Attribute ${attribute} is not defined on entity`)
                    reducedEntities[j][attribute] = normalizedEntities[j][attribute];
                }
            }
            return reducedEntities;
        }
    }
}

export interface Normalizable {
    normalize(attributes? : string[]) : any;
}