**Live Deployment:** [Click Here to Test API](https://opd-token-engine-gq1z.onrender.com)
# OPD Token Engine (Backend Service)

A RESTful API for handling OPD (Outpatient Department) appointments with elastic capacity management. The system is designed to handle real-world scenarios such as doctor delays, patient cancellations, and high-priority emergency overrides.

## Project Overview

This backend service manages booking slots for doctors. Unlike standard booking systems, this engine implements **Elastic Capacity**:
1.  **Strict Capacity:** Doctors have a fixed number of slots (e.g., 3).
2.  **Elastic Overflow:** If a slot is full, the system evaluates the priority of incoming requests.
3.  **Bumping Logic:** High-priority patients (Emergency/Paid) can displace lower-priority patients (Walk-in) if the queue is full.

## Features

* **Elastic Capacity Algorithm:** Dynamically reallocates slots based on patient priority score.
* **Real-time Cancellations:** Endpoint to cancel bookings and immediately free up capacity.
* **Delay Management:** System supports logging doctor delays.
* **Concurrency Handling:** Uses MongoDB atomic operations to prevent double-booking.
* **Full Day Simulation:** Includes a script (`simulate.js`) to stress-test the system with random traffic, cancellations, and edge cases.

## Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose)
* **Testing/Simulation:** Axios

---

## Installation & Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```properties
    MONGO_URI=mongodb://localhost:27017/opd_db
    PORT=3000
    ```

3.  **Start the Server**
    ```bash
    node server.js
    ```

4.  **Run Simulation**
    To verify the logic with 3 doctors and random patient traffic:
    ```bash
    node simulate.js
    ```

---

## API Reference

### 1. Setup Doctor
Initialize a doctor with specific timings and slot capacity.

* **Endpoint:** `POST /api/setup`
* **Body:**
    ```json
    {
      "doctorName": "Dr. Aman",
      "startTime": "09:00",
      "endTime": "12:00",
      "maxCapacity": 3
    }
    ```

### 2. Book Appointment
Request a token. This triggers the Priority Algorithm.

* **Endpoint:** `POST /api/book`
* **Body:**
    ```json
    {
      "doctorId": "65b...",
      "patientName": "John Doe",
      "type": "Paid"
    }
    ```

### 3. Cancel Appointment
Cancels a booking and decrements the slot count, allowing a new patient to enter.

* **Endpoint:** `POST /api/cancel`
* **Body:**
    ```json
    {
      "doctorId": "65b...",
      "patientName": "John Doe"
    }
    ```

### 4. Report Delay
Logs a delay for a specific doctor.

* **Endpoint:** `POST /api/delay`
* **Body:**
    ```json
    {
      "doctorId": "65b...",
      "minutes": 30
    }
    ```

### 5. Get Schedule
View the current status of a slot.

* **Endpoint:** `GET /api/status/:doctorId`

---

## Logic Documentation: Elastic Capacity

The system uses a weighted priority score to resolve conflicts when a slot is full.

| Patient Type | Score | Behavior |
| :--- | :--- | :--- |
| **Emergency** | 100 | Highest priority. Will displace any non-emergency patient. |
| **Paid** | 50 | Medium priority. Can displace Walk-ins. |
| **Walk-in** | 10 | Lowest priority. First to be removed if capacity is reached. |

**Conflict Resolution Strategy:**
When `CurrentBookings == MaxCapacity`:
1.  The system identifies the patient with the **lowest score** currently in the slot.
2.  If `NewPatient.Score > LowestPatient.Score`:
    * The lowest patient is removed (Status: "Bumped").
    * The new patient is added.
3.  Otherwise, the request is rejected (409 Conflict).

---

## Simulation Script (`simulate.js`)

The project includes a simulation script to demonstrate compliance with assignment requirements. It performs the following operations:
1.  **Initialization:** Sets up 3 Doctors (Aman, Trisha, Karan).
2.  **Traffic Generation:** Distributes unique patients randomly across doctors.
3.  **Cancellation Test:** Simulates a patient cancelling to verify the slot becomes available.
4.  **Delay Test:** Simulates a 30-minute delay announcement.
5.  **Emergency Injection:** Injects a critical patient into a full queue to test the bumping logic.

To run the simulation:
```bash
node simulate.js
