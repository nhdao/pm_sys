import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { AdminClientsController } from './admin-clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client
    ])
  ],
  controllers: [AdminClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientsModule {}
