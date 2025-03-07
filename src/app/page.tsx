import { CounterClientComponent } from "@/components/ClientComponent";
import { ElectronCheck } from "@/components/ElectronCheck";
import { ServerPokemonComponent } from "@/components/ServerComponent";
import HomePage from "@/features/home-page";

export default function Home() {
  return (<HomePage />);
  return (
    <main className="flex min-h-screen items-center justify-around p-24 flex-row">
      <ElectronCheck />

      <ServerPokemonComponent />

      <CounterClientComponent />
    </main>
  );
}
