// // import { Controller } from '@nestjs/common';

// // @Controller('greetings')
// // export class GreetingsController {}

// import { Controller, Get, Param, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { GreetingsService } from './greetings.service';

// @Controller('greetings')
// @UseGuards(AuthGuard())
// export class GreetingsController {
//     constructor(private readonly greetingsService: GreetingsService) { }

//     @Get()
//     async getGreetings(): Promise<any> {
//         return this.greetingsService.getGreetings();
//     }

//     @Get('/:user')
//     async getGreetingsPersonalized(@Param('user') user: string): Promise<any> {
//         return this.greetingsService.getGreetingsPersonalized(user);
//     }
// }