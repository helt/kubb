import client from "@kubb/plugin-client/client";
import type { QueryKey } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";

 type GetPetByIdClient = typeof client<GetPetByIdQueryResponse, GetPetById400 | GetPetById404, never>;

 type GetPetById = {
    data: GetPetByIdQueryResponse;
    error: GetPetById400 | GetPetById404;
    request: never;
    pathParams: GetPetByIdPathParams;
    queryParams: never;
    headerParams: never;
    response: GetPetByIdQueryResponse;
    client: {
        parameters: Partial<Parameters<GetPetByIdClient>[0]>;
        return: Awaited<ReturnType<GetPetByIdClient>>;
    };
};

 export const getPetByIdQueryKey = ({ petId }: {
    petId: GetPetByIdPathParams["petId"];
}) => [{ url: "/pet/:petId", params: { petId: petId } }] as const;

 export type GetPetByIdQueryKey = ReturnType<typeof getPetByIdQueryKey>;

 export function getPetByIdQueryOptions({ petId }: {
    petId: GetPetByIdPathParams["petId"];
}, options: GetPetById["client"]["parameters"] = {}) {
    const queryKey = getPetByIdQueryKey({ petId });
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<GetPetById["data"], GetPetById["error"]>({
                method: "get",
                url: `/pet/${petId}`,
                ...options
            });
            return res.data;
        },
    });
}
