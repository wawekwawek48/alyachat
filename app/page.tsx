import MessageForm from '@/components/MessageForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-start pt-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Layanan Pesan <span className="text-blue-600">Langsung</span>
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Hubungi pemilik layanan dan dapatkan balasan secara real-time.
        </p>
      </div>
      <MessageForm />
      
      <footer className="mt-20 text-slate-400 text-sm">
        &copy; 2023 Message App. Powered by Next.js & Firebase.
      </footer>
    </main>
  );
}
