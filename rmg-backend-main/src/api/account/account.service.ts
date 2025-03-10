import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Account, ContactInformation, PrimaryContact } from '../schemas/account.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
@Injectable()
export class AccountService {

    constructor(
        @InjectModel(Account.name) 
        private  accountModel: mongoose.Model<Account>,
        @InjectModel(PrimaryContact.name)
        private primaryContactModel: mongoose.Model<PrimaryContact>,
        @InjectModel(ContactInformation.name)
         private contactInformationModel: mongoose.Model<ContactInformation>,
        //  @InjectModel(Project.name) 
        //  private projectModel: mongoose.Model<Project>,
    ){}

    //create Account
    // async createAccount(createAccountDto: CreateAccountDto, createdBy: string) {
    //     try {
    //       // Convert name and account_code to uppercase
    //       const adminId = new Types.ObjectId(createdBy);
    //       createAccountDto.name = createAccountDto.name.trim().toUpperCase();
    //       createAccountDto.account_code = createAccountDto.account_code.trim().toUpperCase();
    
    //       // Check for duplicate account_code
    //       const existingAccount = await this.accountModel.findOne({
    //         account_code: createAccountDto.account_code,
    //       });
    //       if (existingAccount) {
    //         throw new ConflictException('Account code already exists.');
    //       }
    
    //       // Create and save the account
    //       const account = new this.accountModel({
    //         ...createAccountDto,
    //         created_by: adminId,
    //       });
    //       const savedAccount = await account.save();
    

    //       return {
    //         message: "Account Created Successfully",
    //         data: savedAccount,
    //         statusCode: 200,
    //       };
    //     } catch (error) {
    //       return {
    //         message: "Failed to create the Account",
    //         error: error.message,
    //         statusCode: 400,
    //       };
    //     }
    //   }
    //create Account
    // async createAccount(createAccountDto: CreateAccountDto, createdBy: string) {
    //   try {
    //     if (!Types.ObjectId.isValid(createdBy)) {
    //       throw new HttpException('Invalid admin ID', HttpStatus.BAD_REQUEST);
    //     }
    
    //     const adminId = new Types.ObjectId(createdBy);
    
    //     // Convert name and account_code to uppercase
    //     createAccountDto.name = createAccountDto.name.trim().toUpperCase();
    //     createAccountDto.account_code = createAccountDto.account_code.trim().toUpperCase();
    
    //     // Check for duplicate account_code
    //     const existingAccount = await this.accountModel.findOne({
    //       account_code: createAccountDto.account_code,
    //     }).exec();
    //     if (existingAccount) {
    //       throw new HttpException('Account code already exists.', HttpStatus.CONFLICT);
    //     }
    
    //     // Create and save the account
    //     const account = new this.accountModel({
    //       ...createAccountDto,
    //       created_by: adminId,
    //     });
    
    //     const savedAccount = await account.save();
    
    //     return {
    //       message: 'Account created successfully',
    //       data: savedAccount,
    //       statusCode: HttpStatus.OK,
    //     };
    //   } catch (error) {
    //     console.error('Error creating account:', error);
    
    //     // Handle MongoDB duplicate key error
    //     if (error.code === 11000 && error.keyPattern?.['primary_contact.email']) {
    //       throw new HttpException(
    //         'Duplicate primary contact email',
    //         HttpStatus.BAD_REQUEST
    //       );
    //     }
    
    //     // For other errors
    //     if (!(error instanceof HttpException)) {
    //       throw new HttpException(
    //         error.message || 'An unexpected error occurred',
    //         HttpStatus.BAD_REQUEST
    //       );
    //     }
    
    //     throw error; // Re-throw if already an HttpException
    //   }
    // }
    
    async createAccount(createAccountDto: CreateAccountDto, createdBy: string) {
      try {
        if (!Types.ObjectId.isValid(createdBy)) {
          throw new HttpException('Invalid admin ID', HttpStatus.BAD_REQUEST);
        }
    
        const adminId = new Types.ObjectId(createdBy);
    
        // Convert name and account_code to uppercase
        createAccountDto.name = createAccountDto.name.trim().toUpperCase();
        createAccountDto.account_code = createAccountDto.account_code.trim().toUpperCase();
    
        // Check for duplicate account_code
        const existingAccount = await this.accountModel.findOne({
          account_code: createAccountDto.account_code,
        }).exec();
        if (existingAccount) {
          throw new HttpException('Account code already exists.', HttpStatus.CONFLICT);
        }
    
        // Create and save the account
        const account = new this.accountModel({
          ...createAccountDto,
          created_by: adminId,
        });
    
        const savedAccount = await account.save();
    
        return {
          message: 'Account created successfully',
          data: savedAccount,
          statusCode: HttpStatus.OK,
        };
      } catch (error) {
        console.error('Error creating account:', error);
    
        // Handle MongoDB duplicate key errors based on the error response
        if (error.code === 11000) {
          const errorMessage = error.message || error.response || '';
          if (errorMessage.includes('primary_contact.email')) {
            throw new HttpException(
              'Duplicate primary contact email',
              HttpStatus.BAD_REQUEST
            );
          } else if (errorMessage.includes('contact_information.account_email')) {
            throw new HttpException(
              'Duplicate contact information email',
              HttpStatus.BAD_REQUEST
            );
          }
        }
    
        // For other errors
        if (!(error instanceof HttpException)) {
          throw new HttpException(
            error.message || 'An unexpected error occurred',
            HttpStatus.BAD_REQUEST
          );
        }
    
        throw error; // Re-throw if already an HttpException
      }
    }
    
    
    


//update account by id
async updateAccount(accountId: string, updateAccountDto: UpdateAccountDto, updatedBy: string) {
    try {

        const adminId = new Types.ObjectId(updatedBy);
      // Find the account by ID
      const account = await this.accountModel.findById(accountId);
      if (!account) {
        throw new NotFoundException('Account not found.');
      }

      
      if (updateAccountDto.name) {
        account.name = updateAccountDto.name.trim().toUpperCase();
      }

      if (updateAccountDto.account_code) {

        const existingAccount = await this.accountModel.findOne({
          account_code: updateAccountDto.account_code,
          _id: { $ne: accountId }, // Exclude the current account
        });
        if (existingAccount) {
          throw new ConflictException('Account code already exists.');
        }
        account.account_code = updateAccountDto.account_code.trim().toUpperCase();
      }

      if (updateAccountDto.primary_contact) {
        account.primary_contact = [updateAccountDto.primary_contact]as any;
      }

      if (updateAccountDto.contact_information) {
        account.contact_information = [updateAccountDto.contact_information]as any;
      }

      if (updateAccountDto.status) {
        account.status = updateAccountDto.status;
      }

      account.updated_by = adminId; 
      
      const updatedAccount = await account.save();

      
      return {
        message: "res.AccountUpdatedSuccessfully",
        data: updatedAccount,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: "res.FailedToUpdateAccount",
        error: error.message,
        statusCode: 400,
      };
    }
}
//get all accounts
async getAllAccounts() {
    try {
      const accounts = await this.accountModel
        .find()
        .populate({
          path: 'primary_contact',
          model: this.primaryContactModel,
        })
        .populate({
          path: 'contact_information',
          model: this.contactInformationModel,
        })
        .exec();
  
      return {
        message: "res.AccountsFetchedSuccessfully",  // Customize the message as needed
        data: accounts,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: "res.FailedToFetchAccounts",  // Customize the message as needed
        error: error.message,
        statusCode: 400,
      };
    }
}

  //get  all active account 
  // async getActiveAccounts() {
  //   return await this.accountModel
  //     .find({ status: 'Active' })  // Filter accounts where status is "Active"
  //   //   .populate({
  //   //     path: 'projects',
  //   //     model: this.projectModel, // Populate projects
  //   //   })
  //     .populate({
  //       path: 'primary_contact',
  //       model: this.primaryContactModel, // Populate primary contacts
  //     })
  //     .populate({
  //       path: 'contact_information',
  //       model: this.contactInformationModel, // Populate contact information
  //     })
  //     .exec();
  // }

  // //get all In-Active
  // async getInactiveAccounts() {
  //   return await this.accountModel
  //     .find({ status: 'In-Active' })  
  //   //   .populate({
  //   //     path: 'projects',
  //   //     model: this.projectModel, // Populate projects
  //   //   })
  //     .populate({
  //       path: 'primary_contact',
  //       model: this.primaryContactModel, 
  //     })
  //     .populate({
  //       path: 'contact_information',
  //       model: this.contactInformationModel, 
  //     })
  //     .exec();
  // }
  async getActiveAccounts() {
    try {
      const accounts = await this.accountModel
        .find({ status: 'Active' })
        .populate({
          path: 'primary_contact',
          model: this.primaryContactModel,
        })
        .populate({
          path: 'contact_information',
          model: this.contactInformationModel,
        })
        .exec();
  
      return {
        message: "res.AccountsFetchedSuccessfully",
        data: accounts,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: "res.FailedToFetchAccounts",
        data:[],
        error: error.message,
        statusCode: 400,
      };
    }
  }
  
  async getInactiveAccounts() {
    try {
      const accounts = await this.accountModel
        .find({ status: 'In-Active' })
        .populate({
          path: 'primary_contact',
          model: this.primaryContactModel,
        })
        .populate({
          path: 'contact_information',
          model: this.contactInformationModel,
        })
        .exec();
  
      return {
        message: "res.AccountsFetchedSuccessfully",
        data: accounts,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: "res.FailedToFetchAccounts",
        data:[],
        error: error.message,
        statusCode: 400,
      };
    }
  }

  //get perticular account 
  async getAccountById(accountId: string) {
    const account = await this.accountModel
      .findById(accountId)
    //   .populate({
    //     path: 'projects',
    //     model: this.projectModel, 
    //   })
      .populate({
        path: 'primary_contact',
        model: this.primaryContactModel, 
      })
      .populate({
        path: 'contact_information',
        model: this.contactInformationModel,
      })
      .exec();

    if (!account) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }

    return account;
  }


//delete by id
async deleteAccountById(accountId: string) {
    const account = await this.accountModel.findById(accountId);

    if (!account) {
      throw new NotFoundException(`Account with id ${accountId} not found`);
    }

    // Perform the deletion
    await this.accountModel.findByIdAndDelete(accountId);

    return {
      message: "res.AccountDeletedSuccessfully",
      statusCode: 200,
    };
  }
}
