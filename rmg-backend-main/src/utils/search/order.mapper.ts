import { SearchInputDto} from './search.input.dto';
let _ = require('lodash');
export const OrderMapper = (search_order: SearchInputDto) => {
  let { sort_by, sort_order } = search_order;
  let order_by = sort_by ? sort_by : "id";
  let sorted = sort_order ? sort_order : "DESC";
  let order: any = {  };
  let sortProps = order_by.split(',');
  if(sortProps){
    sortProps.forEach(p => {
     let data: any={};
     _.set(data, p,sorted);
     order = {...order,...data}
    })
  } else{
    order = { [order_by]: sorted}
  }
  return order;
};
