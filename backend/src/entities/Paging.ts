export interface Paging {
    page: number,
    limit: number,
    filter?: Record<string, unknown>,
    with_deleted?: boolean,
    order_field: string,
    order_direction: 'ASC' | 'DESC'
}