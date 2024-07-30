import { loadConfig } from "@app/commons/config";
import { TapModule } from "@app/tap";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfig],
    }),
    TapModule,
  ],
})
export class AppModule {}
