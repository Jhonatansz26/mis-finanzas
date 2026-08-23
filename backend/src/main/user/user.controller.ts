import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { JwtauthGuard } from 'src/auth/guards/JwtGuard.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('user')
@UseGuards(JwtauthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllUsers(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit) : undefined;
      const offsetNum = offset ? parseInt(offset) : undefined;

      return this.userService.findAll(search, limitNum, offsetNum);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener usuarios',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req: any) {
    try {
      const currentUserId = req.user.sub;
      const currentUserRole = req.user.role;
      
      if (currentUserId !== id && currentUserRole !== 'admin') {
        throw new ForbiddenException('No tienes permiso para ver este perfil');
      }
      
      return this.userService.findById(id);
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new HttpException(
        error.message || 'Error al obtener usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @Public()
  async register(@Body() newUser: CreateUserDto) {
    try {
      return this.userService.create(newUser);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al registrar el usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    try {
      const currentUserId = req.user.sub;
      const currentUserRole = req.user.role;
      
      if (currentUserId !== id && currentUserRole !== 'admin') {
        throw new ForbiddenException('No tienes permiso para actualizar este perfil');
      }
      
      return this.userService.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new HttpException(
        error.message || 'Error al actualizar usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    try {
      const currentUserId = req.user.sub;
      const currentUserRole = req.user.role;
      
      if (currentUserId !== id && currentUserRole !== 'admin') {
        throw new ForbiddenException('No tienes permiso para eliminar este perfil');
      }
      
      return this.userService.delete(id);
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new HttpException(
        error.message || 'Error al eliminar usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}