import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function main() {
  const stream = await openrouter.chat.send({
    chatGenerationParams: {
      model: "openrouter/healer-alpha",
      messages: [
        {
          role: "user",
          content:
            "What is in this image, audio and video? Image: https://live.staticflickr.com/3851/14825276609_098cac593d_b.jpg, Audio (base64 wav snippet), Video: https://storage.googleapis.com/cloud-samples-data/video/JaneGoodall.mp4",
        },
      ],
      stream: true,
    },
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
}

main().catch((err) => {
  console.error("OpenRouter error:", err);
  process.exit(1);
});
