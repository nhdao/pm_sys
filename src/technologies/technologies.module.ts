import { Module } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { AdminTechnologiesController } from './admin-technologies.controller';
import { Technology } from './entities/technology.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Technology
    ])
  ],
  controllers: [AdminTechnologiesController],
  providers: [TechnologiesService],
  exports: [TechnologiesService]
})
export class TechnologiesModule {}
