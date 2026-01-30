import Camera from "@/components/Camera";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-white">
      <h1 className="text-4xl font-bold">🌸 PetalPages</h1>
      <Camera />
    </main>
  );
}
