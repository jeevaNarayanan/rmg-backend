// // import { Module } from '@nestjs/common';
// // import { GreetingsController } from './greetings.controller';
// // import { GreetingsService } from './greetings.service';

// // @Module({
// //   controllers: [GreetingsController],
// //   providers: [GreetingsService]
// // })
// // export class GreetingsModule {}
// import { Module } from '@nestjs/common';
// import { GreetingsController } from './greetings.controller';
// import { GreetingsService } from './greetings.service';
// import { PassportModule } from '@nestjs/passport';
// import { AzureADStrategy } from '../auth/azuread.strategy';

// @Module({
//   imports: [
//     PassportModule.register({
//       defaultStrategy: 'AzureAD',
//     })
//   ],
//   controllers: [GreetingsController],
//   providers: [GreetingsService,AzureADStrategy]
// })
// export class GreetingsModule { }