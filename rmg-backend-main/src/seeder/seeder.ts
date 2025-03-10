import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from 'src/api/schemas/admin.schema';
import { AdminsSeeder } from './seeders/admin.seeder';
import { ConfigModule } from '@nestjs/config';

seeder({
  imports: [
    // Load the environment variables
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // Connect to MongoDB using the DB_URI environment variable
    MongooseModule.forRoot(process.env.DB_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    }),
    // Load Mongoose schemas
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema }
    ]),
  ],
}).run([AdminsSeeder]);
