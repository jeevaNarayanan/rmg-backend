import { IsDateString, IsOptional, IsString } from "class-validator";

export class SearchInputDto {

  @IsOptional()
  @IsString()
  page: string;

  @IsOptional()
  @IsString()
  per_page: string;

  @IsOptional()
  @IsString()
  search: string;

  @IsString()
  @IsOptional()
  fieldset: string;

  @IsOptional()
  @IsString()
  search_by: string;

  @IsOptional()
  @IsString()
  sort_by: string;

  @IsOptional()
  @IsString()
  sort_order: string;

  @IsOptional()
  type: string;

  @IsOptional()
  filter: any;

  @IsOptional()
  customer: string

  @IsOptional()
  policy: string

  @IsOptional()
  search_contact: string;

  @IsOptional()
  search_policy: string;

  @IsOptional()
  id: string;

  @IsOptional()
  candidateId: string

  @IsOptional()
  employerId: string

  @IsOptional()
  recruiterId: string

  @IsOptional()
  jobId: string

  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate: string;

  @IsOptional()
  PaymentHistoryId: string

  @IsOptional()
  receiptId: string

  @IsOptional()
  readonly is_Active : boolean
}

