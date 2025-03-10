export const PaginationResponse = (output: any) => {
    let { data, total, pagination } = output;
    let { take, page } = pagination;
    return {
      results: data,
      pagination: {
        per_page: take,
        page: page,
        found: data?.length || 0,
        total,
      },
    };
  };
  