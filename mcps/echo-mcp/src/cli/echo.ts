import { echo } from "../capability/echo";

function print(text: string) {
  console.log(text);
}

export class EchoHandler {
  async run(text: string) {
    print(echo(text));
  }
}
