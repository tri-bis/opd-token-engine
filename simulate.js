const axios = require('axios');
const API = 'https://opd-token-engine-gq1z.onrender.com/api';

// 1. Patients & Priorities
const allPatients = ["Meera Sharma", "Vikas Singh", "Chatwik Suresh", "Dhanush Reddy", "Iline Patrick", "Rishi Joshi", "Arnav Singh", "Mahir Kashyap", "Ivan Denmark", "Juli", "Kevin Hart", "Leo Das"];
const priorities = ["Paid", "Walk-in", "Paid", "Walk-in", "Paid"];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Random patient selection
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function main() {
    console.log("\n-- HOSPITAL SYSTEM STARTING --\n");

    try {
        //  Doctors 
        const doctors = [];
        const configs = [
            { name: "Dr. Aman", cap: 3 },
            { name: "Dr. Trisha", cap: 4 },
            { name: "Dr. Karan", cap: 3 }
        ];

        for (let c of configs) {
            let res = await axios.post(`${API}/setup`, {
                doctorName: c.name,
                startTime: "09:00",
                endTime: "10:00",
                maxCapacity: c.cap
            });
            doctors.push({ id: res.data.doctorId, name: c.name });
        }

        // patients arrival
        const queue = shuffle([...allPatients]); 

        // assigning each doctor patients
        for (let doc of doctors) {
            console.log(`\n--- Arrived Patients For ${doc.name} ---`);
    
            const patientsForThisDoc = queue.splice(0, 4); 

            if (patientsForThisDoc.length === 0) {
                console.log("   (No more patients in waiting room)");
                continue;
            }

            for (let p of patientsForThisDoc) {
                let type = random(priorities);

                try {
                    await axios.post(`${API}/book`, {
                        doctorId: doc.id,
                        patientName: p,
                        type: type
                    });
                    console.log(`   + ${p} (${type})`);
                } catch (err) {
                    console.log(`   - Sorry ${p}, no slots for ${doc.name}`);
                }
                await wait(20); 
            }
        }


        // cancellations & updates
        console.log("\n\n--- Updates & Cancellations ---");
        
        let targetDoc = doctors[0]; 
        let patientToCancel = "Meera Sharma"; 

        try {
            await axios.post(`${API}/cancel`, {
                doctorId: targetDoc.id,
                patientName: patientToCancel
            });
            console.log(`   Reception: "${patientToCancel} cancelled." -> Slot Freed for ${targetDoc.name}`);
        } catch (e) {
            console.log(`   (Tried to cancel ${patientToCancel}, but they weren't booked or found)`);
        }

        // delay
        let delayDoc = doctors[1];
        await axios.post(`${API}/delay`, {
            doctorId: delayDoc.id,
            minutes: 30
        });
        console.log(`   Announcement: "${delayDoc.name} is delayed by 30 mins."`);


        // emergency
        console.log("\n--- EMERGENCY ALERT ---");
        let emDoc = doctors[2]; 
        try {
            let res = await axios.post(`${API}/book`, {
                doctorId: emDoc.id,
                patientName: "Naveen Kumar",
                type: "Emergency"
            });
            console.log(`   Status: Critical Patient Admitted to ${emDoc.name} [${res.data.message}]`);
        } catch (e) {
            console.log(`   Status: Admission Failed (${e.message})`);
        }


        // --- FINAL REPORT ---
      
        console.log(" --- FINAL DOCTOR SCHEDULES ---");     
        
        for (let doc of doctors) {
            let res = await axios.get(`${API}/status/${doc.id}`);
            let list = res.data[0].tokens || [];

            list.sort((a, b) => {
                if(a.status === 'Cancelled') return 1;
                if(b.status === 'Cancelled') return -1;
                return b.priorityScore - a.priorityScore;
            });

            console.log(`\n ${doc.name}:`);
            if (list.length === 0) console.log("   (Empty)");
            
            list.forEach(t => {
                let status = t.status === 'Cancelled' ? " CANCELLED" : " Confirmed";
                if(t.type === 'Emergency') status = "URGENT";
                
                console.log(`- ${t.patientName} [${t.type}] ---> ${status}`);
            });
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();