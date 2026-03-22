import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc, setDoc, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth, secondaryAuth } from '../firebase';

// Store original fetch
const originalFetch = window.fetch;

// Helper to create a Response object
const createResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Helper to get current user ID from token/auth
const getCurrentUserId = () => {
  return auth.currentUser?.uid;
};

// Interceptor
Object.defineProperty(window, 'fetch', {
  value: async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  
  // Only intercept /api/ calls
  console.log(`[Firebase Adapter] Intercepting fetch: ${url}`);
  if (!url.startsWith('/api/')) {
    return originalFetch(input, init);
  }

  const method = init?.method || 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : null;
  const path = url.replace('/api/', '').split('?')[0];

  console.log(`[Firebase Adapter] Intercepted ${method} /api/${path}`, body);

  try {
    // ----------------------------------------------------------------------
    // PUBLIC ENDPOINTS
    // ----------------------------------------------------------------------
    if (path === 'public/notices') {
      const snapshot = await getDocs(collection(db, 'notices'));
      return createResponse(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    
    if (path === 'public/settings') {
      const snapshot = await getDocs(collection(db, 'settings'));
      const settings: Record<string, string> = {};
      snapshot.docs.forEach(d => {
        settings[d.id] = d.data().value;
      });
      return createResponse(settings);
    }
    
    if (path === 'public/exams') {
      const snapshot = await getDocs(collection(db, 'exams'));
      return createResponse(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    
    if (path.startsWith('public/results')) {
      const urlObj = new URL(url, window.location.origin);
      const exam_name = urlObj.searchParams.get('exam_name');
      const roll_number = urlObj.searchParams.get('roll_number');
      
      console.log(`[Firebase Adapter] Fetching results for exam: ${exam_name}, roll: ${roll_number}`);
      
      let q = collection(db, 'results');
      const constraints = [];
      if (exam_name) constraints.push(where('exam_name', '==', exam_name));
      
      const snapshot = await getDocs(query(q, ...constraints));
      console.log(`[Firebase Adapter] Found ${snapshot.size} results documents`);
      let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (roll_number) {
        // Fetch student to match roll number
        const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const student = studentsSnap.docs.find(d => d.data().roll_number === roll_number);
        if (student) {
          results = results.filter((r: any) => r.student_id === student.id);
        } else {
          results = []; // Student not found
        }
      }
      
      console.log(`[Firebase Adapter] Filtered results count: ${results.length}`);

      // Enrich results with student and exam info
      const enrichedResults = await Promise.all(results.map(async (res: any) => {
        let studentName = 'Unknown';
        let studentRoll = 'Unknown';
        let studentClass = 'Unknown';
        let examCategory = 'Unknown';
        let programId = '';

        if (res.student_id) {
          const studentSnap = await getDoc(doc(db, 'users', res.student_id));
          if (studentSnap.exists()) {
            studentName = studentSnap.data().name || 'Unknown';
            studentRoll = studentSnap.data().roll_number || 'Unknown';
            studentClass = studentSnap.data().class || studentSnap.data().current_class || 'Unknown';
            if (!res.batch_id) {
              res.batch_id = studentSnap.data().batch_id;
            }
          }
        }
        
        if (studentClass === 'Unknown' && res.batch_id) {
          const batchSnap = await getDoc(doc(db, 'batches', res.batch_id));
          if (batchSnap.exists()) {
            studentClass = batchSnap.data().class || batchSnap.data().class_name || batchSnap.data().batch_class || 'Unknown';
          }
        }
        
        if (!res.exam_id && res.exam_name) {
          const examsSnap = await getDocs(query(collection(db, 'exams'), where('exam_name', '==', res.exam_name)));
          if (!examsSnap.empty) {
            res.exam_id = examsSnap.docs[0].id;
          }
        }
        
        if (res.exam_id) {
          const examSnap = await getDoc(doc(db, 'exams', res.exam_id));
          if (examSnap.exists()) {
             examCategory = examSnap.data().category || 'Unknown';
             programId = examSnap.data().program_id || '';
             res.total_marks = examSnap.data().total_marks || 0;
          }
        }
        
        return { 
          ...res, 
          student_name: studentName, 
          roll_number: studentRoll, 
          student_class: studentClass,
          exam_category: examCategory,
          program_id: programId,
          monthly_fee: res.monthly_fee || 0
        };
      }));
      
      console.log(`[Firebase Adapter] Enriched results count: ${enrichedResults.length}`);
      
      return createResponse(enrichedResults);
    }

    // ----------------------------------------------------------------------
    // SETTINGS
    // ----------------------------------------------------------------------
    if (path === 'settings') {
      if (method === 'GET') {
        const snapshot = await getDocs(collection(db, 'settings'));
        const settings: Record<string, string> = {};
        snapshot.docs.forEach(d => {
          settings[d.id] = d.data().value;
        });
        return createResponse(settings);
      }
      if (method === 'POST') {
        const { key, value } = body;
        if (key) {
          await setDoc(doc(db, 'settings', key), { value });
        }
        return createResponse({ success: true });
      }
      if (method === 'PUT') {
        for (const [key, value] of Object.entries(body)) {
          await setDoc(doc(db, 'settings', key), { value });
        }
        return createResponse({ success: true });
      }
    }

    // ----------------------------------------------------------------------
    // STUDENTS / USERS
    // ----------------------------------------------------------------------
    if (path === 'students') {
      if (method === 'GET') {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return createResponse(data);
      }
      if (method === 'POST') {
        console.log('Creating student:', body);
        const { email, password, ...restBody } = body;
        if (!email || !password) {
          return createResponse({ error: 'Email and password are required' }, 400);
        }
        
        const cleanEmail = email.trim();
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
          return createResponse({ error: 'Invalid email format' }, 400);
        }
        
        try {
          // Create user in Firebase Auth using secondary app to avoid logging out current user
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
          const uid = userCredential.user.uid;
          
          const docData = { ...restBody, email: cleanEmail, role: 'student', status: 'approved', created_at: new Date().toISOString(), initial_password: password };
          await setDoc(doc(db, 'users', uid), docData);
          
          return createResponse({ id: uid, ...docData });
        } catch (error: any) {
          console.error('Error creating student:', error);
          if (error.code === 'auth/email-already-in-use') {
            // Find existing user and update
            const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const existingUid = querySnapshot.docs[0].id;
              const docData = { ...restBody, email: cleanEmail, role: 'student', status: 'approved', updated_at: new Date().toISOString() };
              await updateDoc(doc(db, 'users', existingUid), docData);
              return createResponse({ id: existingUid, ...docData });
            }
            return createResponse({ error: 'Email is already in use' }, 409);
          }
          throw error;
        }
      }
    }

    if (path.startsWith('students/')) {
      const id = path.split('/')[1];
      if (method === 'GET') {
        const docSnap = await getDoc(doc(db, 'users', id));
        if (docSnap.exists()) {
          // Fetch related data
          const attendanceSnap = await getDocs(query(collection(db, 'attendance'), where('student_id', '==', id)));
          const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('student_id', '==', id)));
          const resultsSnap = await getDocs(query(collection(db, 'results'), where('student_id', '==', id)));
          
          return createResponse({
            id: docSnap.id,
            ...docSnap.data(),
            attendance: attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            payments: paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            results: resultsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          });
        }
        return createResponse({ error: 'Not found' }, 404);
      }
      if (method === 'PUT') {
        await updateDoc(doc(db, 'users', id), body);
        return createResponse({ success: true });
      }
      if (method === 'PATCH' && path.endsWith('/status')) {
        await updateDoc(doc(db, 'users', id), { status: body.status });
        return createResponse({ success: true });
      }
      if (method === 'DELETE') {
        await deleteDoc(doc(db, 'users', id));
        return createResponse({ success: true });
      }
    }

    // ----------------------------------------------------------------------
    // ATTENDANCE
    // ----------------------------------------------------------------------
    if (path === 'attendance') {
      if (method === 'POST') {
        const { batch_id, date, time, records } = body;
        const results = [];
        
        // Fetch existing records for this batch and date ONCE to avoid multiple queries
        const existingSnap = await getDocs(query(
          collection(db, 'attendance'), 
          where('batch_id', '==', batch_id)
        ));
        const existingRecords = existingSnap.docs.filter(d => d.data().date === date);
        const existingMap = new Map(existingRecords.map(d => [d.data().student_id, d.id]));
        
        // Use Promise.all to handle multiple records
        await Promise.all(records.map(async (record: any) => {
          const docData: any = {
            batch_id,
            date,
            time,
            student_id: record.student_id,
            status: record.status,
            created_at: new Date().toISOString()
          };
          if (body.type) docData.type = body.type;
          if (body.exam_id) docData.exam_id = body.exam_id;
          
          let existingDocId;
          if (body.type === 'exam') {
            const existingExamRecords = existingSnap.docs.filter(d => d.data().date === date && d.data().type === 'exam' && d.data().exam_id === body.exam_id);
            const existingExamMap = new Map(existingExamRecords.map(d => [d.data().student_id, d.id]));
            existingDocId = existingExamMap.get(record.student_id);
          } else {
            const existingClassRecords = existingSnap.docs.filter(d => d.data().date === date && d.data().type !== 'exam');
            const existingClassMap = new Map(existingClassRecords.map(d => [d.data().student_id, d.id]));
            existingDocId = existingClassMap.get(record.student_id);
          }
          
          if (existingDocId) {
            // Update existing
            await updateDoc(doc(db, 'attendance', existingDocId), docData);
            results.push({ id: existingDocId, ...docData });
          } else {
            // Create new
            const docRef = await addDoc(collection(db, 'attendance'), docData);
            results.push({ id: docRef.id, ...docData });
          }
        }));
        
        return createResponse({ success: true, records: results });
      }
    }
    
    if (path.startsWith('attendance/batch/')) {
      const parts = path.split('/');
      const batchId = parts[2];
      const date = parts[3];
      
      if (method === 'GET') {
        const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const students = studentsSnap.docs
          .filter(d => d.data().batch_id === batchId || d.data().batch_id_2 === batchId)
          .map(d => ({ id: d.id, ...d.data() }));
          
        const attendanceSnap = await getDocs(query(collection(db, 'attendance'), where('batch_id', '==', batchId)));
        const markedIds = attendanceSnap.docs
          .filter(d => d.data().date === date)
          .map(d => d.data().student_id);
        
        return createResponse({ students, markedStudents: markedIds });
      }
    }

    if (path.startsWith('attendance/report')) {
      const urlObj = new URL(url, window.location.origin);
      const batch_id = urlObj.searchParams.get('batch_id');
      const startDate = urlObj.searchParams.get('startDate');
      const endDate = urlObj.searchParams.get('endDate');
      
      let q = collection(db, 'attendance');
      const constraints = [];
      if (batch_id) constraints.push(where('batch_id', '==', batch_id));
      
      const snapshot = await getDocs(query(q, ...constraints));
      let records = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      
      if (startDate) records = records.filter((r: any) => r.date >= startDate);
      if (endDate) records = records.filter((r: any) => r.date <= endDate);
      
      // Fetch students and batches to enrich the data
      const enrichedRecords = await Promise.all(records.map(async (record: any) => {
        let studentName = 'Unknown';
        let rollNumber = 'Unknown';
        let batchName = 'Unknown';
        
        if (record.student_id) {
          const studentSnap = await getDoc(doc(db, 'users', record.student_id));
          if (studentSnap.exists()) {
            studentName = studentSnap.data().name;
            rollNumber = studentSnap.data().roll_number;
          }
        }
        
        if (record.batch_id) {
          const batchSnap = await getDoc(doc(db, 'batches', record.batch_id));
          if (batchSnap.exists()) {
            batchName = batchSnap.data().name;
          }
        }
        
        return {
          ...record,
          student_name: studentName,
          roll_number: rollNumber,
          batch_name: batchName
        };
      }));
      
      return createResponse(enrichedRecords);
    }

    // ----------------------------------------------------------------------
    // MY PROFILE (STUDENT DASHBOARD)
    // ----------------------------------------------------------------------
    if (path === 'my-profile/image') {
      const uid = getCurrentUserId();
      if (!uid) return createResponse({ error: 'Unauthorized' }, 401);
      
      if (method === 'POST') {
        await updateDoc(doc(db, 'users', uid), { profile_pic: body.image_url });
        return createResponse({ success: true });
      }
    }

    if (path === 'my-profile') {
      const uid = getCurrentUserId();
      if (!uid) return createResponse({ error: 'Unauthorized' }, 401);
      
      if (method === 'PUT') {
        await updateDoc(doc(db, 'users', uid), body);
        return createResponse({ success: true });
      }
      
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (!userSnap.exists()) return createResponse({ error: 'User not found' }, 404);
      
      const userData = userSnap.data();
      let batchData = null;
      let batch_name = 'Regular Batch';
      if (userData.batch_id) {
        const batchSnap = await getDoc(doc(db, 'batches', userData.batch_id));
        if (batchSnap.exists()) {
          batchData = { id: batchSnap.id, ...batchSnap.data() };
          batch_name = batchData.name || batchData.batch_name || 'Regular Batch';
        }
      }
      
      const attendanceSnap = await getDocs(query(collection(db, 'attendance'), where('student_id', '==', uid)));
      const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('student_id', '==', uid)));
      const resultsSnap = await getDocs(query(collection(db, 'results'), where('student_id', '==', uid)));
      
      const results = await Promise.all(resultsSnap.docs.map(async (d) => {
        const data = d.data();
        let b_name = 'N/A';
        let b_class = 'N/A';
        if (data.batch_id) {
          const batchSnap = await getDoc(doc(db, 'batches', data.batch_id));
          if (batchSnap.exists()) {
            const bData = batchSnap.data();
            b_name = bData.name || bData.batch_name || 'N/A';
            b_class = bData.class_name || bData.batch_class || 'N/A';
          }
        }
        
        // Calculate merit position
        let merit_position = data.merit_position || 'N/A';
        if (merit_position === 'N/A') {
          if (data.exam_id) {
            const allResultsSnap = await getDocs(query(collection(db, 'results'), where('exam_id', '==', data.exam_id)));
            const allMarks = allResultsSnap.docs.map(doc => Number(doc.data().marks)).sort((a, b) => b - a);
            const myMark = Number(data.marks);
            const rank = allMarks.indexOf(myMark) + 1;
            if (rank > 0) merit_position = rank.toString();
          } else if (data.exam_name) {
            const allResultsSnap = await getDocs(query(collection(db, 'results'), where('exam_name', '==', data.exam_name)));
            const allMarks = allResultsSnap.docs.map(doc => Number(doc.data().marks)).sort((a, b) => b - a);
            const myMark = Number(data.marks);
            const rank = allMarks.indexOf(myMark) + 1;
            if (rank > 0) merit_position = rank.toString();
          }
        }

        return { id: d.id, ...data, batch_name: b_name, batch_class: b_class, merit_position };
      }));
      
      return createResponse({
        user: { id: uid, ...userData, batch_name },
        batch: batchData,
        attendance: attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        payments: paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        results
      });
    }

    // ----------------------------------------------------------------------
    // MODERATORS
    // ----------------------------------------------------------------------
    if (path === 'moderators') {
      if (method === 'GET') {
        const q = query(collection(db, 'users'), where('role', '==', 'moderator'));
        const snapshot = await getDocs(q);
        return createResponse(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      if (method === 'POST') {
        const { email, password, ...restBody } = body;
        if (!email || !password) {
          return createResponse({ error: 'Email and password are required' }, 400);
        }
        
        const cleanEmail = email.trim();
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
          return createResponse({ error: 'Invalid email format' }, 400);
        }
        
        try {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
          const uid = userCredential.user.uid;
          
          const docData = { ...restBody, email: cleanEmail, role: 'moderator', created_at: new Date().toISOString() };
          await setDoc(doc(db, 'users', uid), docData);
          
          return createResponse({ id: uid, ...docData });
        } catch (error: any) {
          console.error('Error creating moderator:', error);
          if (error.code === 'auth/email-already-in-use') {
            // Find existing user and update
            const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const existingUid = querySnapshot.docs[0].id;
              const docData = { ...restBody, email: cleanEmail, role: 'moderator', updated_at: new Date().toISOString() };
              await updateDoc(doc(db, 'users', existingUid), docData);
              return createResponse({ id: existingUid, ...docData });
            }
            return createResponse({ error: 'Email is already in use' }, 409);
          }
          throw error;
        }
      }
    }
    if (path.startsWith('moderators/')) {
      const id = path.split('/')[1];
      if (method === 'DELETE') {
        await deleteDoc(doc(db, 'users', id));
        return createResponse({ success: true });
      }
    }

    // ----------------------------------------------------------------------
    // STUDENT SEARCH
    // ----------------------------------------------------------------------
    if (path.startsWith('student-search')) {
      const urlObj = new URL(url, window.location.origin);
      const batch_id = urlObj.searchParams.get('batch_id');
      const roll_number = urlObj.searchParams.get('roll_number');
      
      if (!batch_id || !roll_number) return createResponse({ error: 'Missing parameters' }, 400);
      
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const snapshot = await getDocs(q);
      
      const studentDoc = snapshot.docs.find(d => (d.data().batch_id === batch_id || d.data().batch_id_2 === batch_id) && d.data().roll_number === roll_number);
      
      if (!studentDoc) return createResponse({ error: 'Student not found' }, 404);
      
      const studentId = studentDoc.id;
      
      const attendanceSnap = await getDocs(query(collection(db, 'attendance'), where('student_id', '==', studentId)));
      const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('student_id', '==', studentId)));
      const resultsSnap = await getDocs(query(collection(db, 'results'), where('student_id', '==', studentId)));
      
      return createResponse({
        id: studentId,
        ...studentDoc.data(),
        attendance: attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        payments: paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        results: resultsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      });
    }

    // ----------------------------------------------------------------------
    // MY ENROLLMENTS
    // ----------------------------------------------------------------------
    if (path === 'my-enrollments') {
      const uid = getCurrentUserId();
      if (!uid) return createResponse({ error: 'Unauthorized' }, 401);
      
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (!userSnap.exists()) return createResponse({ error: 'User not found' }, 404);
      
      const userData = userSnap.data();
      const enrollmentsSnap = await getDocs(query(collection(db, 'enrollments'), where('phone', '==', userData.phone)));
      return createResponse(enrollmentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    // ----------------------------------------------------------------------
    // STUDY MATERIALS FOR STUDENT
    // ----------------------------------------------------------------------
    if (path.startsWith('study-materials/student/')) {
      const id = path.split('/')[2];
      const userSnap = await getDoc(doc(db, 'users', id));
      if (!userSnap.exists()) return createResponse({ error: 'User not found' }, 404);
      
      const userData = userSnap.data();
      
      const batchDocs = userData.batch_id ? await getDocs(query(collection(db, 'study_materials'), where('batch_id', '==', userData.batch_id))) : { docs: [] };
      
      // Fetch materials for enrolled courses
      const enrolledCourses = userData.enrolled_courses || [];
      const courseIds = enrolledCourses.map((c: any) => c.id);
      const courseDocs = courseIds.length > 0 ? await getDocs(query(collection(db, 'study_materials'), where('course_id', 'in', courseIds))) : { docs: [] };
      
      const studentDocs = await getDocs(query(collection(db, 'study_materials'), where('student_id', '==', id)));
      
      const allDocs = new Map();
      if (batchDocs.docs) {
        batchDocs.docs.forEach(d => allDocs.set(d.id, { id: d.id, ...d.data() }));
      }
      if (courseDocs.docs) {
        courseDocs.docs.forEach(d => allDocs.set(d.id, { id: d.id, ...d.data() }));
      }
      studentDocs.docs.forEach(d => allDocs.set(d.id, { id: d.id, ...d.data() }));
      
      return createResponse(Array.from(allDocs.values()));
    }

    // ----------------------------------------------------------------------
    // AUTO ABSENT
    // ----------------------------------------------------------------------
    if (path === 'attendance/auto-absent') {
      const { batch_id, date } = body;
      const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      const students = studentsSnap.docs.filter(d => (d.data().batch_id === batch_id || d.data().batch_id_2 === batch_id) && (d.data().status === 'active' || d.data().status === 'approved' || !d.data().status));
      
      const attendanceSnap = await getDocs(query(collection(db, 'attendance'), where('batch_id', '==', batch_id)));
      const markedIds = attendanceSnap.docs.filter(d => d.data().date === date && d.data().type !== 'exam').map(d => d.data().student_id);
      
      // Check for exams today
      const examsSnap = await getDocs(query(collection(db, 'exams'), where('batch_id', '==', batch_id), where('exam_date', '==', date)));
      const todayExams = examsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      let count = 0;
      
      for (const docSnap of students) {
        // Mark class attendance as absent if not marked
        if (!markedIds.includes(docSnap.id)) {
          await addDoc(collection(db, 'attendance'), {
            student_id: docSnap.id,
            batch_id,
            date,
            status: 'absent',
            type: 'class',
            reason: 'Auto'
          });
          count++;
        }
        
        // Mark exam attendance as absent if not marked
        for (const exam of todayExams) {
          const examMarked = attendanceSnap.docs.some(d => 
            d.data().date === date && 
            d.data().type === 'exam' && 
            d.data().exam_id == exam.id && 
            d.data().student_id == docSnap.id
          );
          
          if (!examMarked) {
            await addDoc(collection(db, 'attendance'), {
              student_id: docSnap.id,
              batch_id,
              date,
              status: 'absent',
              type: 'exam',
              exam_id: exam.id,
              reason: 'Auto'
            });
            // We don't increment count here as it's usually for class attendance, 
            // but we could if we want to show total actions.
          }
        }
      }
      return createResponse({ message: `Marked ${count} students as absent`, count });
    }

    // ----------------------------------------------------------------------
    // ENROLLMENTS
    // ----------------------------------------------------------------------
    if (path === 'enrollments') {
      if (method === 'GET') {
        const snapshot = await getDocs(collection(db, 'enrollments'));
        return createResponse(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      if (method === 'POST') {
        console.log('[Firebase Adapter] Processing Enrollment:', body);
        const { email, gmail, password, phone, name, profile_pic, ...rest } = body;
        const userEmail = email || gmail;
        
        let uid = null;
        
        // If email and password are provided, create a user account
        if (userEmail && password) {
          try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, userEmail.trim(), password);
            uid = userCredential.user.uid;
            
            const userData = {
              name,
              email: userEmail.trim(),
              phone,
              role: 'student',
              status: 'pending', // Initial status is pending
              student_type: body.course_title ? 'online' : 'offline',
              profile_pic: profile_pic || '',
              created_at: new Date().toISOString(),
              initial_password: password
            };
            
            await setDoc(doc(db, 'users', uid), userData);
            console.log('[Firebase Adapter] Created user for enrollment:', uid);
          } catch (error: any) {
            console.error('[Firebase Adapter] Error creating user during enrollment:', error);
            if (error.code === 'auth/email-already-in-use') {
              // Try to find existing user UID to link the enrollment
              const q = query(collection(db, 'users'), where('email', '==', userEmail.trim()));
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                uid = querySnapshot.docs[0].id;
                console.log('[Firebase Adapter] Linked existing user to enrollment:', uid);
              }
            } else {
              return createResponse({ error: error.message }, 400);
            }
          }
        }

        const enrollmentData = {
          ...body,
          user_id: uid,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'enrollments'), enrollmentData);
        return createResponse({ id: docRef.id, ...enrollmentData });
      }
    }

    if (path.startsWith('enrollments/') && path.endsWith('/status')) {
      const id = path.split('/')[1];
      if (method === 'PUT') {
        await updateDoc(doc(db, 'enrollments', id), { status: body.status });
        return createResponse({ success: true });
      }
    }

    // ----------------------------------------------------------------------
    // MESSAGES
    // ----------------------------------------------------------------------
    if (path.startsWith('messages/') && path.endsWith('/read')) {
      const id = path.split('/')[1];
      if (method === 'PUT') {
        await updateDoc(doc(db, 'messages', id), { is_read: true });
        return createResponse({ success: true });
      }
    }

    // ----------------------------------------------------------------------
    // AUTH PROFILE & PASSWORD
    // ----------------------------------------------------------------------
    if (path === 'auth/profile') {
      const user = auth.currentUser;
      const uid = user?.uid;
      if (!uid || !user) return createResponse({ error: 'Unauthorized' }, 401);
      
      try {
        const cleanEmail = body.email ? body.email.trim() : user.email;
        if (cleanEmail && cleanEmail !== user.email) {
          await updateEmail(user, cleanEmail);
        }
        await updateDoc(doc(db, 'users', uid), { name: body.name, email: cleanEmail });
        return createResponse({ success: true });
      } catch (error: any) {
        console.error('Profile update error:', error);
        return createResponse({ error: error.message || 'Failed to update profile' }, 400);
      }
    }
    if (path === 'auth/password') {
      const user = auth.currentUser;
      if (!user) return createResponse({ error: 'Unauthorized' }, 401);
      
      const { oldPassword, newPassword } = body;
      if (!oldPassword || !newPassword) return createResponse({ error: 'Missing passwords' }, 400);
      
      try {
        if (user.email) {
          const credential = EmailAuthProvider.credential(user.email, oldPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
          return createResponse({ success: true, message: 'Password updated successfully' });
        } else {
          return createResponse({ error: 'User email not found' }, 400);
        }
      } catch (error: any) {
        console.error('Password update error:', error);
        return createResponse({ error: error.message || 'Failed to update password' }, 400);
      }
    }

    // ----------------------------------------------------------------------
    // PAYMENTS
    // ----------------------------------------------------------------------
    if (path === 'payments' && method === 'GET') {
      const snapshot = await getDocs(collection(db, 'payments'));
      const payments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const enrichedPayments = await Promise.all(payments.map(async (p: any) => {
        if (!p.student_name && p.student_id) {
          const studentSnap = await getDoc(doc(db, 'users', p.student_id));
          if (studentSnap.exists()) {
            p.student_name = studentSnap.data().name || 'Unknown';
            p.roll_number = studentSnap.data().roll_number || 'Unknown';
            if (!p.batch_name && studentSnap.data().batch_id) {
              const batchSnap = await getDoc(doc(db, 'batches', studentSnap.data().batch_id));
              if (batchSnap.exists()) {
                p.batch_name = batchSnap.data().name || 'Unknown';
              }
            }
          }
        }
        return p;
      }));
      
      return createResponse(enrichedPayments);
    }

    // ----------------------------------------------------------------------
    // RESET DATA
    // ----------------------------------------------------------------------
    if (path === 'reset-data' && method === 'POST') {
      const { type } = body;
      let collectionName = '';
      if (type === 'students') collectionName = 'users';
      else if (type === 'batches') collectionName = 'batches';
      else if (type === 'payments') collectionName = 'payments';
      else if (type === 'enrollments') collectionName = 'enrollments';
      
      if (collectionName) {
        let q = collection(db, collectionName);
        if (collectionName === 'users') {
          q = query(collection(db, 'users'), where('role', '==', 'student')) as any;
        }
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, collectionName, d.id)));
        await Promise.all(deletePromises);
        return createResponse({ success: true, message: `All ${type} deleted successfully.` });
      }
      return createResponse({ error: 'Invalid type' }, 400);
    }

    // ----------------------------------------------------------------------
    // GENERIC COLLECTIONS (GET, POST, DELETE)
    // ----------------------------------------------------------------------
    const genericCollections = [
      'batches', 'programs', 'web-recorded-classes', 'web-class-schedules',
      'courses', 'gallery', 'messages', 'enrollments', 'chapters', 'exams',
      'routines', 'resources', 'notices', 'study-materials', 'payments', 'results', 'live-classes', 'reviews'
    ];

    // Check if path matches a generic collection or an ID within it
    const collectionMatch = genericCollections.find(c => path === c || path.startsWith(`${c}/`));
    
    if (collectionMatch) {
      const collectionName = collectionMatch.replace(/-/g, '_'); // e.g. web-recorded-classes -> web_recorded_classes
      const id = path.split('/')[1];

      if (method === 'GET') {
        const snapshot = await getDocs(collection(db, collectionName));
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return createResponse(data);
      }
      
      if (method === 'POST') {
        console.log(`[Firebase Adapter] POST /api/${path}`, body);
        const docData = { ...body, created_at: new Date().toISOString() };
        const docRef = await addDoc(collection(db, collectionName), docData);
        return createResponse({ id: docRef.id, ...docData });
      }

      if (method === 'PUT' && id) {
        await updateDoc(doc(db, collectionName, id), body);
        return createResponse({ success: true });
      }

      if (method === 'DELETE' && id) {
        await deleteDoc(doc(db, collectionName, id));
        return createResponse({ success: true });
      }
    }

    // Fallback for unhandled routes
    console.warn(`[Firebase Adapter] Unhandled route: ${method} /api/${path}`);
    return createResponse({ error: 'Route not implemented in Firebase Adapter' }, 404);

  } catch (error: any) {
    console.error(`[Firebase Adapter] Error processing ${method} /api/${path}:`, error);
    return createResponse({ error: error.message }, 500);
  }
}, writable: true, configurable: true });
