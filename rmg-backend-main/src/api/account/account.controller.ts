import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.gaurd';
import { RolesGuard } from '../auth/roles.gaurd';
import { AccountService } from './account.service';
import { Public, Roles } from '../auth/roles.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import { RequestWithUser } from 'src/utils/interface.utils';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('account')
@UseGuards(AuthGuard,RolesGuard)
export class AccountController {

    constructor(private readonly accountService: AccountService) {}
 
    //create account
    //   @Roles('admin')
    //   @Post('create')
    // async createAccount(
    //   @Body() createAccountDto: CreateAccountDto,
    //   @Req() request: Request,
    // ) {
    //   const req = request as RequestWithUser;
    //   const createdBy = req.user.sub; 
    //   return this.accountService.createAccount(createAccountDto, createdBy);
    // }
    @Roles('admin')
    @Post('create')
    async createAccount(
      @Body() createAccountDto: CreateAccountDto,
      @Req() request: Request,
    ): Promise<any> {
      try {
        const req = request as RequestWithUser;
        const createdBy = req.user.sub;
        return await this.accountService.createAccount(createAccountDto, createdBy);
      } catch (error) {
        console.error('Error creating account:', error);
    
        // Check if the error is an instance of HttpException
        if (error instanceof HttpException) {
          throw new HttpException(error.getResponse(), error.getStatus());
        }
    
        // For other unexpected errors, throw a generic error message
        throw new HttpException('An unexpected error occurred', HttpStatus.BAD_REQUEST);
      }
    }
    


  //update account
  @Roles('admin')
  @Put('update/:account_id')
  async updateAccount(
    @Param('account_id') accountId: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Req() request: Request,
  ) {
    const req = request as RequestWithUser;
    const updatedBy = req.user.sub; 

    try {
      const response = await this.accountService.updateAccount(accountId, updateAccountDto, updatedBy);
      return response; 
    } catch (error) {
      return {
        message: "res.FailedToUpdateAccount",
        error: error.message,
        statusCode: 400,
      };
    }
}


//get all accounts
@Roles('admin')  // Ensure the roles-based authorization is applied
@Get()
async getAllAccounts() {
    const result = await this.accountService.getAllAccounts(); // Call the service method
    return {
      message: "res.AccountsFetchedSuccessfully", // Customize the success message
      data: result.data, // Assuming 'result' contains 'data' from the service
      statusCode: 200,
    };
  } 

//get all active account
// @Roles('admin')
// @Get('active')
// async getActiveAccounts(): Promise<any[]> {
//   return this.accountService.getActiveAccounts();
// }

// @Roles('admin')
// @Get('inactive')
// async getInActiveAccounts(): Promise<any[]>{
//     return this.accountService.getInactiveAccounts();
// }

@Roles('admin')
@Get('active')
async getActiveAccounts(): Promise<{ message: string; data: any[]; statusCode: number }> {
  try {
    return await this.accountService.getActiveAccounts();
  } catch (error) {
    return {
      message: "res.FailedToFetchAccounts",
      data: [],
      statusCode: 400,
    };
  }
}

@Roles('admin')
@Get('inactive')
async getInactiveAccounts(): Promise<{ message: string; data: any[]; statusCode: number }> {
  try {
    return await this.accountService.getInactiveAccounts();
  } catch (error) {
    return {
      message: "res.FailedToFetchAccounts",
      data: [],
      statusCode: 400,
    };
  }
}

//get account by id 
@Roles('admin')
@Get(':id')
async getAccountById(@Param('id') id: string): Promise<any> {
  return this.accountService.getAccountById(id);
}

//delete by id
@Roles('admin')
@Delete(':id')  
async deleteAccountById(@Param('id') id: string) {
  try {
    const result = await this.accountService.deleteAccountById(id);

    return {
      message: result.message,
      statusCode: result.statusCode,
    };
  } catch (error) {
    return {
      message: "Failed to Delete the Account ",  
      error: error.message,
      statusCode: 400,
    };
  }
}
}
