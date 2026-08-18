document.addEventListener('DOMContentLoaded', () => {
    const osintForm = document.getElementById('osintForm');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const submitBtn = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('resultContainer');
    const parsedDataContainer = document.getElementById('parsedData');
    const statusBadge = document.getElementById('statusBadge');

    osintForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const number = phoneNumberInput.value.trim();
        if (!number) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
        resultContainer.classList.remove('hidden');
        parsedDataContainer.innerHTML = '<p class="loading-text">Fetching details...</p>';

        const apiUrl = `https://tracexdata-api.onrender.com/api/lookup?key=Trialdemo&number=${encodeURIComponent(number)}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const data = await response.json();
            
            parsedDataContainer.innerHTML = '';
            statusBadge.textContent = 'Success';
            statusBadge.style.backgroundColor = '#dcfce7';
            statusBadge.style.color = '#15803d';

            formatAndDisplayData(data, parsedDataContainer);

        } catch (error) {
            statusBadge.textContent = 'Failed';
            statusBadge.style.backgroundColor = '#fee2e2';
            statusBadge.style.color = '#b91c1c';
            
            parsedDataContainer.innerHTML = `
                <div class="data-row">
                    <span class="data-label" style="color:#dc2626">Error</span>
                    <span class="data-value">Unable to fetch records.</span>
                </div>`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-search"></i> Run Lookup`;
        }
    });

    function formatAndDisplayData(dataObj, container) {
        let textContent = typeof dataObj === 'string' ? dataObj : (dataObj.results ? (typeof dataObj.results === 'string' ? dataObj.results : JSON.stringify(dataObj.results)) : JSON.stringify(dataObj));

        let lines = textContent.split(/[\n\r]+/);
        const cleanedLines = lines.map(line => line.trim())
            .filter(line => {
                const l = line.toLowerCase();
                return l && !l.includes('http') && !l.includes('api') && !l.includes('credit') && !l.includes('request') && !l.includes('success') && !l.includes('number lookup result') && !l.includes('lookup result for') && !/^[-_=#]+$/.test(l);
            });

        let rawJoined = cleanedLines.join(' ');
        
        const patterns = [
            { label: 'Name', regex: /Name:\s*([^👤👨‍💼📱🏠📡💳📧📞\n]+)/i },
            { label: 'Father Name', regex: /Father Name:\s*([^👤👨‍💼📱🏠📡💳📧📞\n]+)/i },
            { label: 'Mobile', regex: /(?:Mobile|Phone|Number):\s*([^👤👨‍💼📱🏠📡💳📧📞\n]+)/i },
            { label: 'Alt Mobile', regex: /(?:Alt Mobile|Alt Number|Alternative Mobile|Secondary Number|Other Number):\s*([^👤👨‍💼📱🏠📡💳📧📞\n]+)/i },
            { label: 'Email', regex: /(?:Email|Mail):\s*([^👤👨‍💼📱🏠📡💳📧📞\n]+)/i },
            { label: 'Alt Email', regex: /(?:Alt Email|Alternative Email|Secondary Email):\s*([^👤👨‍💼📱🏠📡💳📧📞\n]+)/i },
            { label: 'Address', regex: /Address:\s*([^👤👨‍💼📱🏠📡💳📧📞\n]+)/i },
            { label: 'Circle', regex: /Circle:\s*([^👤👨‍💼📱🏠📡💳📧📞\n]+)/i },
            { label: 'Aadhaar', regex: /Aadhaar:\s*([^👤👨‍💼📱🏠📡💳📧📞\n]+)/i }
        ];

        let parsedItems = [];
        patterns.forEach(item => {
            const match = rawJoined.match(item.regex);
            if (match && match[1]) {
                let val = match[1].trim().replace(/[-_=#]+$/, '');
                if (val) parsedItems.push({ label: item.label, value: val });
            }
        });

        if (parsedItems.length > 0) {
            parsedItems.forEach(item => {
                const row = document.createElement('div');
                row.className = 'data-row';

                const label = document.createElement('span');
                label.className = 'data-label';
                label.textContent = item.label;

                const val = document.createElement('span');
                val.className = 'data-value';
                val.textContent = item.value;

                row.appendChild(label);
                row.appendChild(val);
                container.appendChild(row);
            });
        } else {
            container.innerHTML = `<div class="data-row"><span class="data-value">No records found.</span></div>`;
        }
    }
});
      
