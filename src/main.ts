import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle("Telegram mini app Game API")
    .setDescription("Description of the API for playing inside Telegram")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);  

  await app.listen(PORT);
  console.log(`Server start at port: ${PORT}...`);
}
bootstrap();
