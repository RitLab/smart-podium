import React from "react";

/**
 * Pagar buat halaman materi ajar.
 *
 * Sejak rute materi jadi ANAK MainLayout, lapisan Penampil Web hidup sepohon
 * sama halaman-halaman itu. React nggak punya pemulihan bawaan: satu komponen
 * lempar error, seluruh pohon di atasnya ikut dibuang — termasuk <webview> yang
 * lagi dipakai konferensi. Kejadian beneran: buka /3d tanpa parameter url bikin
 * useGLTF lempar, dan #root langsung kosong.
 *
 * Jadi halaman materi dipagarin. Yang jatuh cuma halamannya; konferensi di
 * balik layar tetep jalan, dan guru bisa balik ke Penampil Web tanpa kehilangan
 * apa-apa.
 */
type Props = { children: React.ReactNode; onKembali: () => void };
type State = { jatuh: boolean; pesan: string };

class PagarGalat extends React.Component<Props, State> {
  state: State = { jatuh: false, pesan: "" };

  static getDerivedStateFromError(e: unknown): State {
    return { jatuh: true, pesan: String((e as Error)?.message || e) };
  }

  componentDidCatch(e: unknown) {
    console.error("Halaman materi gagal dibuka:", e);
  }

  componentDidUpdate(prev: Props) {
    // Halaman ganti -> kasih kesempatan render lagi, jangan nyangkut di layar
    // galat buat materi yang sebenernya baik-baik aja.
    if (prev.children !== this.props.children && this.state.jatuh) {
      this.setState({ jatuh: false, pesan: "" });
    }
  }

  render() {
    if (!this.state.jatuh) return this.props.children;
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-gray-100 text-gray-700">
        <p className="text-lg font-bold">Materi ini nggak bisa dibuka</p>
        <p className="text-sm text-gray-500 max-w-md text-center px-6">{this.state.pesan}</p>
        <button
          onClick={this.props.onKembali}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold active:scale-95"
        >
          Kembali
        </button>
      </div>
    );
  }
}

export default PagarGalat;
