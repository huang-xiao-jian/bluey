import { echo } from "../core/echo";

export class EchoHandler {
  async run(text: string) {
    console.log(echo(text));
  }
}
