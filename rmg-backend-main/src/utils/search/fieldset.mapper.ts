export const FieldSetMapper = (fieldset: string) => {
    let fields = {}
    if(fieldset) fields = fieldset.split(',').reduce((acc, field)=>{ acc[field] = true; return acc }, {});
    fields['created_at'] = true;
    fields['updated_at'] = true;
    return fields;
  };
  
  //..........................