import { SearchInputDto } from "./search.input.dto";
export const PaginationMapper = (paginateInput: SearchInputDto) => {
  const { page, per_page = '10' } = paginateInput;
  const skip =
    parseInt(page) > 1 ? (parseInt(page) - 1) * parseInt(per_page) : 0;
  return {
    page: parseInt(page) || 1,
    take: parseInt(per_page) || 10,
    skip: skip,
  };
};
