import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ExhibitionModule } from './exhibition/exhibition.module';
import { ArtistModule } from './artist/artist.module';
import { ArtworkModule } from './artwork/artwork.module';
import { FloorPlanModule } from './floorplan/floorplan.module';
import { GuestModule } from './guest/guest.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';
import { ArtistReplacementModule } from './artist-replacement/artist-replacement.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'art_exhibition',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    ExhibitionModule,
    ArtistModule,
    ArtworkModule,
    FloorPlanModule,
    GuestModule,
    MediaModule,
    ArtistReplacementModule,
  ],
})
export class AppModule {}
