import { Controller, Get, Query } from "@nestjs/common";
import { TapCkbParams } from "./params";
import { TapService } from "./tap.service";

@Controller({
  path: "tap",
})
export class TapController {
  constructor(private readonly service: TapService) {}

  @Get("/ckb")
  async tapCkb(
    @Query()
    { address, amount }: TapCkbParams,
  ) {
    return this.service.tapCkb(address, amount);
  }
}
