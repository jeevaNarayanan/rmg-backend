import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { RequestWithUser } from 'src/utils/interface.utils';
import { AuthGuard } from '../auth/auth.gaurd';
import { RolesGuard } from '../auth/roles.gaurd';
import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { Roles } from '../auth/roles.decorator';
import { UpdateLogDto } from './dto/update-log.dto';

@Controller('log')
@UseGuards(AuthGuard,RolesGuard)
export class LogController {
  constructor(private readonly logService: LogService){}

    //crete log
    @Roles('employer')
    @Post(':projectId')
    async createLog(
      @Param('projectId') projectId: string,
      @Body() logDto: CreateLogDto,
      @Req() request: Request,
    ) {
      const req = request as RequestWithUser;
      const employerId = req.user.sub; // Extract user ID from token
  
      return this.logService.createLog(projectId, employerId, logDto);
    }

    //update log
    @Roles('employer')
    @Put(':logId')
    async updateLog(
      @Param('logId') logId: string,
      @Body() logDto: UpdateLogDto,
    ) {
      return await this.logService.updateLog(logId, logDto);
    }
   
    
  //get log buy id
  @Roles('employer')
  @Get(':logId')
  async getLogById(@Param('logId') logId: string): Promise<any> {
    try {
      const log = await this.logService.getLogById(logId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Log retrieved successfully',
        data: log,
      };
    } catch (error) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message,
        data: null,
      });
    }
  }

//get log, employer by logs
@Roles('employer')
@Get('project/:projectId')
async getLogs(
  @Param('projectId') projectId: string,
  @Req() request: Request,
) {
  const req = request as RequestWithUser;
  const employerId = req.user.sub; // Extract employer ID from token
  
  return this.logService.getLogs(projectId, employerId);
}
}
