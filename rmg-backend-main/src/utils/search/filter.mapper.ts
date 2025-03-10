import { SearchInputDto } from "./search.input.dto";
//import * as _ from 'lodash';

export const FilterMapper = (
  filter_input: any,
  search_input: SearchInputDto
) => {
  let { search, search_by } = search_input;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sort_by, sort, ...rest } = filter_input;

  if (filter_input?.search) {
    search = filter_input.search;
    delete rest.search;
  }
  if (filter_input?.search_by) {
    search_by = filter_input.search_by;
    delete rest.search_by;
  }

  const searchFilter: any = { ...rest };
  const searchBy = search_by ? search_by : "name";
  const searchProps = searchBy.split(',');

  // Construct filters based on search input
  const filters: any[] = [];

  if (search) {
    searchProps.forEach(p => {
      // const filterData = { ...searchFilter };
      // Adjust to handle nested fields
      // _.set('filterData', p, { $regex: search, $options: 'i' });
      filters.push({ [p]: { $regex: search, $options: 'i' }})});
     
    return filters.length > 1 ? { $or: filters } : filters[0];
  }
  return searchFilter;
};
