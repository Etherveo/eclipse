export async function uploadToMultiPlatform(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const ext = file.name.split('.').pop() || 'png';
  const mimeType = file.type || 'image/png';

  const results: string[] = [];

  // Jalankan semua upload secara paralel, cegah 1 error merusak yang lain (Promise.allSettled)
  await Promise.allSettled([
    // 1. Catbox
    (async () => {
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", file);
      const res = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: form });
      if (res.ok) results.push((await res.text()).trim());
    })(),

    // 2. Qu.Ax
    (async () => {
      const form = new FormData();
      form.append("files[]", file);
      const res = await fetch("https://qu.ax/upload.php", { method: "POST", body: form });
      const data = await res.json();
      if (data?.success && data?.files?.[0]?.url) results.push(data.files[0].url);
    })(),

    // 3. Uguu
    (async () => {
      const form = new FormData();
      form.append("files[]", file);
      const res = await fetch("https://uguu.se/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data?.files?.[0]?.url) results.push(data.files[0].url);
    })(),

    // 4. Image2Url (Dengan penyamaran User-Agent)
    (async () => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("https://www.image2url.com/api/upload", {
        method: "POST",
        body: form,
        headers: { "User-Agent": "CT Nasa/1.0.0" }
      });
      const data = await res.json();
      if (data?.success && data?.url) results.push(data.url);
    })(),

    // 5. Paste.rs (Membutuhkan raw buffer ArrayBuffer)
    (async () => {
      const res = await fetch("https://paste.rs", {
        method: "POST",
        body: buffer,
        headers: { "Content-Type": mimeType }
      });
      if (res.ok) {
        const text = await res.text();
        results.push(text.trim() + `.${ext}`);
      }
    })()
  ]);

  // Filter hanya URL yang valid (jaga-jaga kalau ada API yang me-return error text biasa)
  return results.filter(url => url && url.startsWith('http'));
}