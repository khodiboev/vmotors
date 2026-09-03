import { NestFactory } from '@nestjs/core';
import { BatchModule } from './batch.module';

async function bootstrap() {
	const app = await NestFactory.create(BatchModule);
	await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap().catch((error) => {
	console.error('Failed to bootstrap vmotors-batch', error);
	process.exit(1);
});
