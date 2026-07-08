import CsvUploader from "@/components/CsvUploader";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#296554] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            GrowEasy Importer
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
            Upload your CSV file below. The system will parse the data, map it to the strict CRM schema, and validate the records.
          </p>
        </div>
        <CsvUploader />
      </div>
    </main>
  );
}
