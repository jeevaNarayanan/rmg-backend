import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Model } from 'mongoose';
import { Seeder } from 'nestjs-seeder';
import { Admin } from 'src/api/schemas/admin.schema';

@Injectable()
export class AdminsSeeder implements Seeder {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
  ) {}

  async seed(): Promise<any> {
    const hashedPassword = await hash('Admin@123', 10);
    const admin = {
      name: 'Rmg Admin',
      email: 'jeeva.n@agiratech.com',
      is_active: 'active',
      is_primary: true,
      password: hashedPassword,
      password_update_date: Date.now(),
    };

    return await this.adminModel.create(admin);
  }

  async drop(): Promise<any> {
    return this.adminModel.deleteMany({});
  }
}
