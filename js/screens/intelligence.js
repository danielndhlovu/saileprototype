// ============================================================================
// Saile Platform v2 — Strategic Intelligence & Scenario Modeling
// ============================================================================

function renderIntelligence(container, options) {
  var view = 'scenarios'; // or 'board-reports'

  function render() {
    var html = '<div class="space-y-6 pb-20">';
    html += '<div class="flex justify-between items-end">';
    html += '<div><h1 class="text-2xl font-black text-[#1F2937] uppercase tracking-tighter">Strategic Intelligence</h1>';
    html += '<p class="text-sm text-[#6B7280]">Advanced decision support for SFS Executive Team</p></div>';
    html += '</div>';

    html += '<div class="flex gap-2">';
    html += '<button class="intel-tab px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ' + (view === 'scenarios' ? 'bg-[#1E3A8A] text-white' : 'bg-white text-[#1E3A8A] border border-gray-200') + '" data-view="scenarios">Scenario Modeling</button>';
    html += '<button class="intel-tab px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ' + (view === 'board-reports' ? 'bg-[#1E3A8A] text-white' : 'bg-white text-[#1E3A8A] border border-gray-200') + '" data-view="board-reports">Board Reporting</button>';
    html += '</div>';

    if (view === 'scenarios') html += renderScenarios();
    else html += renderBoardReports();

    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.intel-tab').forEach(btn => {
      btn.onclick = function() { view = this.dataset.view; render(); };
    });

    if (view === 'scenarios') attachScenarioEvents(container);
  }

  render();
}

function renderScenarios() {
  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 bg-white rounded-3xl border border-[#d1d5db] p-8 space-y-8 shadow-sm">
        <h3 class="text-xs font-black uppercase tracking-widest text-[#1F2937]">Decision Inputs</h3>

        <div class="space-y-6">
           <div class="space-y-3">
              <label class="flex justify-between text-[10px] font-black uppercase text-[#6B7280]"><span>Interest Rate Change</span> <span id="rate-val" class="text-[#1E3A8A]">7.5%</span></label>
              <input type="range" id="rate-slider" min="3" max="15" step="0.5" value="7.5" class="w-full accent-[#1E3A8A]">
              <p class="text-[8px] text-gray-400 italic">Affects yield and estimated client retention.</p>
           </div>

           <div class="space-y-3">
              <label class="flex justify-between text-[10px] font-black uppercase text-[#6B7280]"><span>Portfolio Growth Target</span> <span id="growth-val" class="text-[#1E3A8A]">+15%</span></label>
              <input type="range" id="growth-slider" min="0" max="50" step="1" value="15" class="w-full accent-[#1E3A8A]">
           </div>

           <div class="space-y-3">
              <label class="flex justify-between text-[10px] font-black uppercase text-[#6B7280]"><span>Risk Shift (PAR)</span> <span id="risk-val" class="text-[#1E3A8A]">4.2%</span></label>
              <input type="range" id="risk-slider" min="1" max="20" step="0.1" value="4.2" class="w-full accent-[#1E3A8A]">
           </div>
        </div>

        <button class="w-full py-3 bg-[#1F2937] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all">Save Model</button>
      </div>

      <div class="lg:col-span-2 space-y-6">
         <div class="bg-[#1E3A8A] rounded-3xl p-8 text-white shadow-xl">
            <h3 class="text-xs font-black uppercase tracking-widest opacity-60 mb-8">Scenario Projection — 12 Month Impact</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
               <div>
                  <div class="text-[9px] uppercase font-bold opacity-50">Projected Revenue</div>
                  <div class="text-2xl font-black" id="proj-rev">MWK 14.2M</div>
                  <div class="text-[10px] text-[#059669] font-bold mt-1">▲ +14% vs Baseline</div>
               </div>
               <div>
                  <div class="text-[9px] uppercase font-bold opacity-50">Provision Impact</div>
                  <div class="text-2xl font-black text-[#D97706]" id="proj-prov">MWK 2.4M</div>
                  <div class="text-[10px] opacity-50 mt-1">Estimated Provisioning</div>
               </div>
               <div>
                  <div class="text-[9px] uppercase font-bold opacity-50">Net Margin</div>
                  <div class="text-2xl font-black" id="proj-margin">31.4%</div>
                  <div class="text-[10px] text-[#059669] font-bold mt-1">▲ +3.2pp</div>
               </div>
            </div>
         </div>

         <div class="bg-white rounded-3xl border border-[#d1d5db] p-8 shadow-sm">
            <h3 class="text-xs font-black uppercase tracking-widest text-[#1F2937] mb-6">Strategic Recommendation</h3>
            <div class="flex gap-4">
               <div class="w-12 h-12 bg-[#E0E7FF] rounded-2xl flex items-center justify-center text-xl">💡</div>
               <div class="flex-1">
                  <p class="text-sm font-bold text-[#1F2937]">Expansion Viable</p>
                  <p class="text-xs text-[#6B7280] leading-relaxed">Based on current inputs, SFS can sustain a 15% growth rate even if PAR increases to 5.5%. The liquidity buffer remains above RBM 20% requirements.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  `;
}

function renderBoardReports() {
  return `
    <div class="bg-white rounded-3xl border border-[#d1d5db] p-8 shadow-sm">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-8 mb-8">
        <div>
           <h3 class="text-lg font-bold text-[#1F2937]">Board Presentation Generator</h3>
           <p class="text-sm text-[#6B7280]">Generate quarterly executive briefing materials.</p>
        </div>
        <button class="px-8 py-3 bg-[#1E3A8A] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">Generate PDF</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         ${renderReportToggle('Executive Summary', true)}
         ${renderReportToggle('Financial Performance', true)}
         ${renderReportToggle('Portfolio Quality', true)}
         ${renderReportToggle('Branch Scorecard', true)}
         ${renderReportToggle('Product Analysis', true)}
         ${renderReportToggle('Compliance Status', true)}
         ${renderReportToggle('Risk Register', false)}
         ${renderReportToggle('Audit Samples', false)}
      </div>
    </div>
  `;
}

function renderReportToggle(label, checked) {
  return `
    <div class="p-4 border border-gray-100 rounded-2xl flex items-center justify-between">
       <span class="text-xs font-bold text-[#1F2937]">${label}</span>
       <input type="checkbox" ${checked ? 'checked' : ''} class="w-4 h-4 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]">
    </div>
  `;
}

function attachScenarioEvents(container) {
  const sliders = ['rate', 'growth', 'risk'];
  sliders.forEach(s => {
    const el = container.querySelector(`#${s}-slider`);
    if (el) {
      el.oninput = function() {
        container.querySelector(`#${s}-val`).textContent = this.value + (s === 'rate' || s === 'risk' ? '%' : '%');
        updateProjectionValues(container);
      };
    }
  });
}

function updateProjectionValues(container) {
  const rate = parseFloat(container.querySelector('#rate-slider').value);
  const growth = parseFloat(container.querySelector('#growth-slider').value);
  const risk = parseFloat(container.querySelector('#risk-slider').value);

  // Simple simulated math for prototype
  const rev = 12.4 + (growth/10) + (rate - 7.5);
  const margin = 28.2 + (rate - 7.5) - (risk/5);

  container.querySelector('#proj-rev').textContent = 'MWK ' + rev.toFixed(1) + 'M';
  container.querySelector('#proj-margin').textContent = margin.toFixed(1) + '%';
}

window.renderIntelligence = renderIntelligence;
