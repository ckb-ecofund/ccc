import { Module } from "@nestjs/common";
import { TapController } from "./tap.controller";
import { TapService } from "./tap.service";

@Module({
  providers: [TapService],
  exports: [TapService],
  controllers: [TapController],
})
export class TapModule {}
