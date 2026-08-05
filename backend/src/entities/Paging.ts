export interface Paging {
    page: number,
    limit: number,
    filter?: any,
    with_deleted?: boolean,
    order_field: string,
    order_direction: 'ASC' | 'DESC'
}