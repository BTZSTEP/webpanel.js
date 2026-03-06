
(function () {
  if (document.getElementById("web-panel-dev")) return;
  const VERSION = "1.2.0";

  // Responsive sizing
  const isMobile = window.innerWidth <= 600;
  const PW = isMobile ? Math.min(window.innerWidth - 16, 360) : 450;
  const PH = isMobile ? Math.min(window.innerHeight - 60, 380) : 400;
  const PL = isMobile ? Math.max((window.innerWidth - PW) / 2, 8) : 50;
  const PT = isMobile ? 60 : 100;

  const registry = [];
  function registerPlugin(plugin) { registry.push(plugin); }

  registerPlugin({ id: "cookie", label: "Get Cookie", color: "#1a6e2e", fetchData() { const raw = document.cookie; if (!raw) return "No cookies found."; const lines = raw.split(";").map((c) => { const [key, ...rest] = c.trim().split("="); return `${key.trim()}: ${rest.join("=").trim()}`; }); return `=== COOKIES (${lines.length}) ===\n${lines.join("\n")}`; } });
  registerPlugin({ id: "local", label: "Local Storage", color: "#1565c0", fetchData() { const s = localStorage; if (!s.length) return "localStorage is empty."; const lines = []; for (let i = 0; i < s.length; i++) { const k = s.key(i), v = s.getItem(k); let d = v; try { d = JSON.stringify(JSON.parse(v), null, 2); } catch (_) {} lines.push(`[${k}]\n${d}`); } return `=== LOCAL STORAGE (${lines.length} keys) ===\n\n${lines.join("\n\n")}`; } });
  registerPlugin({ id: "session", label: "Session Storage", color: "#c62828", fetchData() { const s = sessionStorage; if (!s.length) return "sessionStorage is empty."; const lines = []; for (let i = 0; i < s.length; i++) { const k = s.key(i), v = s.getItem(k); let d = v; try { d = JSON.stringify(JSON.parse(v), null, 2); } catch (_) {} lines.push(`[${k}]\n${d}`); } return `=== SESSION STORAGE (${lines.length} keys) ===\n\n${lines.join("\n\n")}`; } });

  // Eruda plugin
  registerPlugin({
    id: "eruda", label: "Eruda Console", color: "#6a1b9a",
    fetchData() { return "Loading Eruda..."; },
    onActivate() {
      if (window.eruda && window.eruda._isInit) { window.eruda.show(); return; }
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/eruda";
      s.onload = () => { window.eruda.init(); window.eruda.show(); };
      document.head.appendChild(s);
    }
  });

  function makeBtn(label, bg) { const b = document.createElement("button"); b.textContent = label; Object.assign(b.style, { flex: "1", padding: isMobile ? "10px 4px" : "8px", border: "none", cursor: "pointer", background: bg || "#444", color: "#fff", borderRadius: "6px", fontFamily: "monospace", fontSize: isMobile ? "12px" : "11px", transition: "all 0.2s", minWidth: "0" }); return b; }

  const panel = document.createElement("div"); panel.id = "web-panel-dev";
  Object.assign(panel.style, { position: "fixed", top: PT + "px", left: PL + "px", width: PW + "px", height: PH + "px", background: "#1e1e1e", color: "#fff", border: "1px solid #555", borderRadius: "12px", zIndex: "999999999", fontFamily: "monospace", boxShadow: "0 5px 20px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", transition: "left .25s ease" });

  const header = document.createElement("div"); header.textContent = `Web Panel by Lann  v${VERSION}`;
  Object.assign(header.style, { padding: "10px", cursor: "move", background: "#2a2a2a", fontWeight: "bold", touchAction: "none", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "12px 12px 0 0", userSelect: "none", fontSize: isMobile ? "13px" : "14px" });

  const minimizeBtn = document.createElement("span"); minimizeBtn.textContent = "−";
  Object.assign(minimizeBtn.style, { cursor: "pointer", fontSize: "20px", padding: "0 6px", flexShrink: "0" });
  header.appendChild(minimizeBtn);

  const content = document.createElement("div"); Object.assign(content.style, { flex: "1", display: "flex", flexDirection: "column", overflow: "hidden" });
  const textarea = document.createElement("textarea"); textarea.placeholder = "Welcome To Web Panel by Lann\n\nSelect a data source below:";
  Object.assign(textarea.style, { flex: "1", background: "#111", color: "#0f0", border: "none", padding: "10px", resize: "none", fontSize: "12px", fontFamily: "monospace", display: "none", outline: "none" });

  const searchContainer = document.createElement("div"); Object.assign(searchContainer.style, { display: "none", flexDirection: "column", flex: "1", overflow: "hidden" });
  const searchInputRow = document.createElement("div"); Object.assign(searchInputRow.style, { display: "flex", gap: "5px", padding: "8px", background: "#252525", borderBottom: "1px solid #444" });
  const searchInput = document.createElement("input"); searchInput.type = "text"; searchInput.placeholder = "Search JS, HTML, CSS...";
  Object.assign(searchInput.style, { flex: "1", padding: "8px", background: "#111", color: "#fff", border: "1px solid #444", borderRadius: "4px", fontFamily: "monospace", fontSize: "12px", outline: "none" });
  const searchExecBtn = makeBtn("Search", "#1565c0"); searchExecBtn.style.flex = "0 0 60px";
  const caseSensitiveBtn = makeBtn("Aa", "#444"); caseSensitiveBtn.style.flex = "0 0 35px"; let caseSensitive = false;
  const regexBtn = makeBtn(".*", "#444"); regexBtn.style.flex = "0 0 35px"; let useRegex = false;
  searchInputRow.append(searchInput, searchExecBtn, caseSensitiveBtn, regexBtn);
  const searchResults = document.createElement("div"); Object.assign(searchResults.style, { flex: "1", overflow: "auto", background: "#111", padding: "5px", fontSize: "11px" });
  const searchStatus = document.createElement("div"); Object.assign(searchStatus.style, { padding: "5px 10px", background: "#1e1e1e", borderTop: "1px solid #444", fontSize: "11px", color: "#888" }); searchStatus.textContent = "Ready to search";
  searchContainer.append(searchInputRow, searchResults, searchStatus); content.append(textarea, searchContainer);

  const mainBtnRow = document.createElement("div"); Object.assign(mainBtnRow.style, { display: "flex", gap: "4px", padding: "4px", background: "#1e1e1e", flexWrap: "wrap" });
  const actionBtnRow = document.createElement("div"); Object.assign(actionBtnRow.style, { display: "none", gap: "4px", padding: "4px", background: "#1e1e1e" });
  const searchBtnRow = document.createElement("div"); Object.assign(searchBtnRow.style, { display: "none", gap: "4px", padding: "4px", background: "#1e1e1e" });

  const btnBack = makeBtn("Back", "#444"); const btnRefresh = makeBtn("Refresh", "#444"); const btnCopy = makeBtn("Copy", "#444");
  const btnSearchBack = makeBtn("Back", "#444"); const btnClearSearch = makeBtn("Clear", "#444"); const btnCopySearch = makeBtn("Copy Results", "#444");
  actionBtnRow.append(btnBack, btnRefresh, btnCopy); searchBtnRow.append(btnSearchBack, btnClearSearch, btnCopySearch);

  let currentPlugin = null;

  function renderPluginButtons() {
    while (mainBtnRow.firstChild) mainBtnRow.removeChild(mainBtnRow.firstChild);
    registry.forEach((plugin) => {
      const btn = makeBtn(plugin.label, plugin.color);
      btn.onclick = () => {
        currentPlugin = plugin;
        if (plugin.onActivate) { plugin.onActivate(); showMainButtons(); return; }
        showActionButtons(); textarea.value = plugin.fetchData();
      };
      mainBtnRow.appendChild(btn);
    });
    const btnSearch = makeBtn("🔍 Search", "#37474f"); btnSearch.onclick = showSearchMode; mainBtnRow.appendChild(btnSearch);
  }

  function showMainButtons() { mainBtnRow.style.display = "flex"; actionBtnRow.style.display = "none"; searchBtnRow.style.display = "none"; textarea.style.display = "none"; searchContainer.style.display = "none"; textarea.value = ""; currentPlugin = null; }
  function showActionButtons() { mainBtnRow.style.display = "none"; actionBtnRow.style.display = "flex"; searchBtnRow.style.display = "none"; textarea.style.display = "block"; searchContainer.style.display = "none"; }
  function showSearchMode() { mainBtnRow.style.display = "none"; actionBtnRow.style.display = "none"; searchBtnRow.style.display = "flex"; textarea.style.display = "none"; searchContainer.style.display = "flex"; currentPlugin = null; searchInput.focus(); }

  btnBack.onclick = showMainButtons; btnSearchBack.onclick = showMainButtons;
  btnRefresh.onclick = () => { if (currentPlugin) textarea.value = currentPlugin.fetchData(); btnRefresh.textContent = "Refreshed"; setTimeout(() => (btnRefresh.textContent = "Refresh"), 1000); };
  btnCopy.onclick = async () => { await navigator.clipboard.writeText(textarea.value); btnCopy.textContent = "Copied"; setTimeout(() => (btnCopy.textContent = "Copy"), 1000); };
  btnClearSearch.onclick = () => { searchInput.value = ""; searchResults.innerHTML = ""; searchStatus.textContent = "Ready to search"; searchInput.focus(); };
  btnCopySearch.onclick = () => { const allText = Array.from(searchResults.querySelectorAll("div")).map((d) => d.textContent).join("\n"); if (allText) { navigator.clipboard.writeText(allText); btnCopySearch.textContent = "Copied"; setTimeout(() => (btnCopySearch.textContent = "Copy Results"), 1000); } };
  caseSensitiveBtn.onclick = () => { caseSensitive = !caseSensitive; caseSensitiveBtn.style.background = caseSensitive ? "#1565c0" : "#444"; };
  regexBtn.onclick = () => { useRegex = !useRegex; regexBtn.style.background = useRegex ? "#1565c0" : "#444"; };

  async function performGlobalSearch() { const query = searchInput.value.trim(); if (!query) return; searchStatus.textContent = "Searching..."; searchResults.innerHTML = ""; const resources = []; document.querySelectorAll("script[src]").forEach((s) => resources.push({ type: "JS", url: s.src })); document.querySelectorAll("link[rel='stylesheet']").forEach((s) => resources.push({ type: "CSS", url: s.href })); resources.push({ type: "HTML", url: location.href }); document.querySelectorAll("script:not([src])").forEach((s, i) => { if (s.textContent.trim()) resources.push({ type: "INLINE-JS", url: `inline-script-${i}`, content: s.textContent }); }); document.querySelectorAll("style").forEach((s, i) => { if (s.textContent.trim()) resources.push({ type: "INLINE-CSS", url: `inline-style-${i}`, content: s.textContent }); }); const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); const searchPattern = useRegex ? new RegExp(query, caseSensitive ? "g" : "gi") : new RegExp(escapedQuery, caseSensitive ? "g" : "gi"); let totalMatches = 0, searchedCount = 0; const results = []; for (const res of resources) { try { let text = res.content; if (!text) { const r = await fetch(res.url); text = await r.text(); } const lines = text.split("\n"); const fileMatches = []; lines.forEach((line, idx) => { searchPattern.lastIndex = 0; const matchResult = searchPattern.exec(line); if (matchResult) { const matchPos = matchResult.index; const contextPad = 80; const start = Math.max(0, matchPos - contextPad); const end = Math.min(line.length, matchPos + matchResult[0].length + contextPad); const snippet = (start > 0 ? "..." : "") + line.substring(start, end) + (end < line.length ? "..." : ""); fileMatches.push({ line: idx + 1, text: snippet, matchPos: matchPos - start + (start > 0 ? 1 : 0) }); totalMatches++; } }); if (fileMatches.length) results.push({ ...res, matches: fileMatches }); searchedCount++; searchStatus.textContent = `Searching... ${searchedCount}/${resources.length}`; } catch (_) { searchedCount++; } } if (!results.length) { searchResults.innerHTML = '<div style="color:#888;padding:20px;text-align:center;">No matches found</div>'; } else { results.forEach((result) => { const fileDiv = document.createElement("div"); Object.assign(fileDiv.style, { marginBottom: "12px", border: "1px solid #2a2a2a", borderRadius: "6px", overflow: "hidden", background: "#161616" }); const hdr = document.createElement("div"); Object.assign(hdr.style, { background: "#212121", padding: "6px 10px", display: "flex", flexDirection: "column", gap: "4px", borderBottom: "1px solid #333" }); const hdrTop = document.createElement("div"); Object.assign(hdrTop.style, { display: "flex", justifyContent: "space-between", alignItems: "center" }); const typeBadge = document.createElement("span"); typeBadge.textContent = result.type; Object.assign(typeBadge.style, { fontSize: "9px", fontWeight: "bold", padding: "2px 7px", borderRadius: "3px", letterSpacing: "0.8px", textTransform: "uppercase", background: result.type.includes("CSS") ? "#0d47a1" : result.type.includes("JS") ? "#bf360c" : "#1b5e20", color: "#fff" }); const matchCount = document.createElement("span"); matchCount.textContent = result.matches.length + " match" + (result.matches.length > 1 ? "es" : ""); Object.assign(matchCount.style, { fontSize: "10px", color: "#f9a825", fontWeight: "bold" }); hdrTop.append(typeBadge, matchCount); const isInline = result.url.startsWith("inline"); const urlEl = document.createElement("a"); urlEl.textContent = result.url; urlEl.href = isInline ? "#" : result.url; if (!isInline) urlEl.target = "_blank"; Object.assign(urlEl.style, { fontSize: "10px", color: "#64b5f6", textDecoration: "none", wordBreak: "break-all", fontFamily: "monospace", lineHeight: "1.4" }); hdr.append(hdrTop, urlEl); const matchesDiv = document.createElement("div"); result.matches.forEach((match) => { const matchLine = document.createElement("div"); Object.assign(matchLine.style, { padding: "4px 0", borderTop: "1px solid #1a1a1a", fontFamily: "monospace", fontSize: "11px", color: "#ccc", cursor: "pointer", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: "1.6", display: "flex", alignItems: "flex-start" }); const lineNum = document.createElement("span"); lineNum.textContent = match.line; Object.assign(lineNum.style, { color: "#555", minWidth: "36px", textAlign: "right", paddingRight: "10px", userSelect: "none", flexShrink: "0", borderRight: "1px solid #2a2a2a", marginRight: "10px" }); const codeEl = document.createElement("span"); let safe = match.text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); try { const pat = useRegex ? new RegExp("("+query+")", caseSensitive?"g":"gi") : new RegExp("("+escapedQuery+")", caseSensitive?"g":"gi"); safe = safe.replace(pat,'<mark style="background:#f9a825;color:#000;padding:0 2px;border-radius:2px;font-weight:bold;">$1</mark>'); } catch(_){} codeEl.innerHTML = safe; Object.assign(codeEl.style, { flex: "1", paddingRight: "8px" }); matchLine.append(lineNum, codeEl); matchLine.onmouseover = () => matchLine.style.background = "#1c2333"; matchLine.onmouseout = () => matchLine.style.background = "transparent"; matchLine.onclick = () => { navigator.clipboard.writeText(match.text); matchLine.style.background = "#1b3a1b"; setTimeout(() => matchLine.style.background = "transparent", 700); }; matchesDiv.appendChild(matchLine); }); fileDiv.append(hdr, matchesDiv); searchResults.appendChild(fileDiv); }); } searchStatus.textContent = `Found ${totalMatches} matches in ${results.length} files (${searchedCount} searched)`; }
  searchExecBtn.onclick = performGlobalSearch; searchInput.onkeydown = (e) => { if (e.key === "Enter") performGlobalSearch(); };

  panel.append(header, content, mainBtnRow, actionBtnRow, searchBtnRow);
  document.body.appendChild(panel); renderPluginButtons();

  let isDrag = false, offsetX = 0, offsetY = 0;
  function startDrag(e) { if (e.target === minimizeBtn) return; isDrag = true; panel.style.transition = "none"; const x = e.touches ? e.touches[0].clientX : e.clientX; const y = e.touches ? e.touches[0].clientY : e.clientY; offsetX = x - panel.offsetLeft; offsetY = y - panel.offsetTop; }
  function moveDrag(e) { if (!isDrag) return; e.preventDefault(); const x = e.touches ? e.touches[0].clientX : e.clientX; const y = e.touches ? e.touches[0].clientY : e.clientY; panel.style.left = (x - offsetX) + "px"; panel.style.top = (y - offsetY) + "px"; }
  function endDrag() { if (!isDrag) return; isDrag = false; panel.style.transition = "left .25s ease"; const rect = panel.getBoundingClientRect(); if (rect.left < 30 || window.innerWidth - rect.right < 30) { panel.style.left = rect.left + rect.width / 2 < window.innerWidth / 2 ? -(rect.width - 40) + "px" : (window.innerWidth - 40) + "px"; } }
  header.addEventListener("mousedown", startDrag); document.addEventListener("mousemove", moveDrag); document.addEventListener("mouseup", endDrag);
  header.addEventListener("touchstart", startDrag, { passive: false }); document.addEventListener("touchmove", moveDrag, { passive: false }); document.addEventListener("touchend", endDrag);

  let minimized = false, prevHeight = panel.style.height;
  function toggleMin() { if (!minimized) { prevHeight = panel.style.height; panel.style.height = "40px"; content.style.display = "none"; mainBtnRow.style.display = actionBtnRow.style.display = searchBtnRow.style.display = "none"; minimized = true; minimizeBtn.textContent = "+"; } else { panel.style.height = prevHeight; content.style.display = "flex"; if (!currentPlugin) { mainBtnRow.style.display = "flex"; } else { actionBtnRow.style.display = "flex"; textarea.style.display = "block"; } minimized = false; minimizeBtn.textContent = "−"; } }
  minimizeBtn.onclick = toggleMin; header.addEventListener("dblclick", toggleMin);
  let lastTap = 0; header.addEventListener("touchend", () => { const now = Date.now(); if (now - lastTap < 300) toggleMin(); lastTap = now; });
})();
