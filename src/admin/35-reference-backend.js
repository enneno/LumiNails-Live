    // Boundary between the copied reference UI and LumiNails' existing data/authorization code.
    // No reference-project schema, environment value or content crosses this boundary.
    const referenceRecordIds = new Map();
    let referenceNextId = 1;
    const referenceKey = item => `${item.tipus}:${item.adat.id}`;
    function referenceId(item) {
        const key = referenceKey(item);
        if (!referenceRecordIds.has(key)) referenceRecordIds.set(key, referenceNextId++);
        return referenceRecordIds.get(key);
    }
    function referenceItem(id) {
        const item = allapot.foglalasElemek.find(item => referenceId(item) === id);
        if (!item) throw new Error('Az időpont már nem található. Frissítsd a listát.');
        return item;
    }
    const referenceStatus = status => ({ pending:'new', confirmed:'confirmed', blocked:'confirmed', active:'confirmed', done:'completed', cancelled:'cancelled', cancelled_by_customer:'guest_cancelled' }[status] || 'confirmed');
    const originalStatus = (status, type) => type === 'blocked'
        ? ({ completed:'done', guest_cancelled:'cancelled_by_customer', cancelled:'cancelled_by_customer' }[status] || 'blocked')
        : ({ new:'pending', confirmed:'confirmed', completed:'done', cancelled:'cancelled', guest_cancelled:'cancelled_by_customer' }[status] || 'confirmed');
    function referenceRequireAdmin() {
        if (!allapot.session || !allapot.adminVerified) throw new Error('A művelethez aktuális admin belépés szükséges.');
        onlineStatusz('');
    }
    function referenceCheckStatus() {
        const status = document.getElementById('admin-online-status');
        if (status?.classList.contains('hiba')) throw new Error(status.textContent || 'A mentés nem sikerült.');
    }
    function referenceCheckCms(){const result=window.LumiAdminCms?.result?.();if(result?.error)throw new Error(result.message);}
    function referenceBooking(item) {
        const row=item.adat, cancelled=allapot.lemondasEsemenyek.get(String(row.id));
        return { id:referenceId(item), updatedAt:row.updated_at || row.created_at || '', startsAt:row.starts_at, endsAt:row.ends_at,
            date:new Date(row.starts_at).toLocaleDateString('hu-HU'), time:idoInputErtek(row.starts_at), endTime:idoInputErtek(row.ends_at),
            dateInput:datumInputErtek(row.starts_at), timeInput:idoInputErtek(row.starts_at), trackId:'lashes', trackLabel:'Köröm',
            serviceLabel:row.services?.name || row.services?.description || '', serviceGroups:[{label:'',names:[row.services?.name || row.services?.description || 'Kézi időpont']}],
            serviceIds:row.service_id?[row.service_id]:allapot.szolgaltatasok.filter(service=>service.name===row.services?.name).slice(0,1).map(service=>service.id), guestName:row.customer_name || row.reason || 'Kézi időpont', createdBy:null,
            phone:row.customer_phone || '', email:row.customer_email || '', note:item.tipus==='booking'?foglalasMegjegyzesMegjelenites(row):'', adminComment:'',
            paidAmountHuf:row.paid_amount ?? null, status:referenceStatus(row.status), cancelledAt:cancelled?.lemondas || null,
            inspirations:item.tipus==='booking'?foglalasInspiracioKepek(row):[], coupon:[row.coupon_code,row.coupon_title].filter(Boolean).join(' · '), nailStyle:[row.nail_style,row.nail_style_note].filter(Boolean).join(' · '),
            cancellationAcknowledgedAt:cancelled?.tudomasulvetel || null, source:item.tipus==='blocked'?'manual':'online', confirmationCode:row.public_reference || '' };
    }
    function referenceWindowRows() {
        if(allapot.referenceWindows)return allapot.referenceWindows.map(row=>({...row}));
        return Array.from(document.querySelectorAll('#admin-idosav-lista .admin-idosav-kartya')).map(card=>({
            id:card.dataset.id, work_date:mezo(card,'work_date')?.value || '', start_time:mezo(card,'start_time')?.value || '', end_time:mezo(card,'end_time')?.value || '',
            slot_step_minutes:Number(mezo(card,'slot_step_minutes')?.value || 30), active:true
        }));
    }
    function referenceSnapshot() {
        const authorized=Boolean(allapot.session && allapot.adminVerified);
        if (!authorized) return { authorized:false, ready:Boolean(allapot.referenceAuthReady), pending:Boolean(allapot.session&&!allapot.adminVerified), authError:document.getElementById('admin-auth-status')?.classList.contains('hiba')?document.getElementById('admin-auth-status').textContent:'' };
        return { authorized, bookings:allapot.foglalasElemek.map(referenceBooking), services:allapot.szolgaltatasok, coupons:allapot.kuponok || [],
            guests:allapot.vendegProfilok || [], events:(allapot.esemenynaploElemek || []).map(event=>({...event,referenceBookingId:allapot.foglalasElemek.find(item=>item.adat.id===event.booking_id)?referenceId(allapot.foglalasElemek.find(item=>item.adat.id===event.booking_id)):null})), windows:referenceWindowRows(),
            couponScopes:referenceCouponScopes(), calculator:referenceCalculator(),
            publication:{text:document.getElementById('admin-publication-status')?.textContent || '',state:document.getElementById('admin-publication-status')?.dataset.publicationState || ''},
            emailErrors:adminV2EmailHibasEsemenyek().map(row=>row.id),
            phoneVisible:adminElemek().telefonLathato?.checked ?? true, cms:window.LumiAdminCms?.source?.() || null };
    }
    const referenceLoaders={overview:'attekintes',bookings:'foglalasok',prices:'szolgaltatasok',coupons:'kuponok',schedule:'idosavok',guests:'vendegek',logs:'esemenynaplo',settings:'beallitasok',calculator:'arkalkulator'};
    function referenceCouponScopes(){const select=document.createElement('select');select.innerHTML=kuponSzolgaltatasOptions({});return Array.from(select.options).map(option=>({value:option.value,label:option.textContent}));}
    function referenceCalculator(){
        const service=arKalkulatorAktivSzolgaltatas();
        return {serviceId:arKalkulatorAllapot.szolgaltatasId,base:arKalkulatorAllapot.alapAr,couponId:arKalkulatorAllapot.kuponId,
            services:arKalkulatorAlapszolgaltatasok().map(row=>({value:String(row.id),label:arKalkulatorSzolgaltatasNev(row)})),
            prices:arKalkulatorArak(service).map(value=>({value,label:arKalkulatorArSzoveg(value)})),
            decorations:arKalkulatorDiszitesek().map(row=>({id:String(row.id),label:arKalkulatorTetelNev(row),prices:arKalkulatorArak(row).map(value=>({value,label:arKalkulatorArSzoveg(value)}))})),
            extras:Array.from(arKalkulatorAllapot.extrak.entries()).map(([id,row])=>({id,count:row.darab,price:row.ar})),
            coupons:[{value:'',label:'Nincs kuponkedvezmény'},...arKalkulatorAktivKuponok().map(row=>({value:String(row.id),label:row.code+' – '+arKalkulatorKuponFelirat(row)}))],
            hint:document.getElementById('admin-arkalkulator-kupon-segedlet')?.textContent||'',
            total:document.getElementById('admin-arkalkulator-vegosszeg')?.textContent||'0 Ft',
            breakdown:Array.from(document.querySelectorAll('#admin-arkalkulator-bontas > div')).map(row=>({label:row.querySelector('span')?.textContent,value:row.querySelector('strong')?.textContent}))};
    }
    window.LumiAdminBackend = {
        snapshot:referenceSnapshot,
        createId:()=>ujAdminMuveletAzonosito(),
        authEmail:()=>adminEmail(adminElemek()),
        async signIn(password){if(!allapot.kliens)return {error:{code:'unavailable'}};return allapot.kliens.auth.signInWithPassword({email:adminEmail(adminElemek()),password});},
        subscribe(listener) {
            const root=document.getElementById('admin-tartalom');
            const observer=new MutationObserver(()=>listener());
            if(root)observer.observe(root,{attributes:true,attributeFilter:['hidden']});
            const authStatus=document.getElementById('admin-auth-status');if(authStatus)observer.observe(authStatus,{childList:true,subtree:true});
            const publicationStatus=document.getElementById('admin-publication-status');if(publicationStatus)observer.observe(publicationStatus,{childList:true,subtree:true,attributes:true,attributeFilter:['data-publication-state']});
            queueMicrotask(listener);
            window.addEventListener('lumi:content',listener);
            window.addEventListener('lumi:admin-data',listener);
            return ()=>{observer.disconnect();window.removeEventListener('lumi:content',listener);window.removeEventListener('lumi:admin-data',listener);};
        },
        async load(scope,force=false) {
            referenceRequireAdmin();
            if(force&&['bookings','overview'].includes(scope))adminStudioFoglalasKartyak.clear();
            if(scope==='content'||scope==='gallery'){await window.LumiAdminCms.load(force);referenceCheckCms();}
            else await adminPanelAdatokBetoltese(referenceLoaders[scope] || 'attekintes',force);
            referenceCheckStatus();
            return referenceSnapshot();
        },
        async signOut(){ await kijelentkezes(); },
        async saveBookings(changes) {
            referenceRequireAdmin();
            for(const change of changes){const item=referenceItem(change.id),card=adminStudioFoglalasKartya(item);
                if(change.status)card.querySelector('[data-foglalas-statusz]').value=originalStatus(change.status,item.tipus);
                for(const [field,value] of Object.entries({date:change.date,time:change.time,endTime:change.endTime,note:change.note})){
                    const input=idopontMezo(card,({date:'date',time:'start_time',endTime:'end_time',note:item.tipus==='blocked'?'reason':'admin_message'})[field]);if(input&&value!==undefined)input.value=value;
                }
                if(change.paidAmountHuf!==undefined)idopontMezo(card,'paid_amount').value=change.paidAmountHuf ?? '';
            }
            await foglalasStatuszokMentese({recordKeys:changes.map(change=>referenceKey(referenceItem(change.id)))});referenceCheckStatus();return referenceSnapshot();
        },
        async savePayment(id,amount) {
            referenceRequireAdmin();const item=referenceItem(id),card=adminStudioFoglalasKartya(item);
            idopontMezo(card,'paid_amount').value=amount ?? '';await adminStudioFizetesMentese(card);referenceCheckStatus();return referenceSnapshot();
        },
        async removeBooking(id) {
            referenceRequireAdmin();const item=referenceItem(id);
            const deleted=await rekordTorlese(item.tipus==='blocked'?'blocked_times':'bookings',item.adat.id,foglalasokBetoltese);
            if(!deleted)throw new Error('Az időpont törlése nem sikerült.');allapot.foglalasElemek=allapot.foglalasElemek.filter(row=>referenceId(row)!==id);return referenceSnapshot();
        },
        async removeInspirations(id){referenceRequireAdmin();const item=referenceItem(id);if(item.tipus!=='booking')return referenceSnapshot();if(!await foglalasInspiraciokTorlese(adminStudioFoglalasKartya(item)))throw new Error('Az inspirációs képek törlése nem sikerült.');await foglalasokBetoltese();return referenceSnapshot();},
        async acknowledge(id) {
            referenceRequireAdmin();const item=referenceItem(id);if(item.tipus!=='booking')return referenceSnapshot();
            const {error}=await allapot.kliens.from('booking_events').insert({booking_id:item.adat.id,event_type:'customer_cancellation_acknowledged',channel:'admin',status:'success',title:'Vendéglemondás tudomásul véve',message:'Az admin a lemondást átnézte és tudomásul vette.',metadata:{}});
            if(error)throw new Error('A nyugtázás nem sikerült.');await foglalasokBetoltese();return referenceSnapshot();
        },
        async createManual(form) {
            referenceRequireAdmin();await szolgaltatasokBetoltese();const e=adminElemek();
            e.tiltasDatum.value=form.date;e.tiltasKezdes.value=form.time;e.tiltasVege.value=form.endTime;e.tiltasOk.value=form.guestName;
            e.tiltasSzolgaltatas.value=form.serviceIds[0] || '';await tiltasHozzaadas();referenceCheckStatus();await foglalasokBetoltese();return referenceSnapshot();
        },
        async saveServices(rows) {
            referenceRequireAdmin();const list=adminElemek().szolgaltatasLista;window.LumiAdminSheet?.resetWithin(list);list.replaceChildren();
            for(const row of rows.filter(row=>!(row._new&&row._delete))){const card=szolgaltatasKartya(szolgaltatasArNormalizalasa(row)),existing=allapot.szolgaltatasok.find(item=>item.id===row.id);if(row._new&&!existing)card.dataset.draftNew='true';else card.dataset.editorVersion=(row._new?existing?.editor_version:row.editor_version)||'';if(row._delete)card.dataset.draftDelete='true';list.append(card);}
            await szolgaltatasokMentese();referenceCheckStatus();return referenceSnapshot();
        },
        async saveCoupons(rows) {
            referenceRequireAdmin();const list=document.getElementById('admin-kupon-lista');window.LumiAdminSheet?.resetWithin(list);list.replaceChildren();
            for(const row of rows.filter(row=>!(row._new&&row._delete))){const card=kuponKartya(row);if(row._new)card.dataset.draftNew='true';if(row._delete)card.dataset.draftDelete='true';list.append(card);}
            await kuponokMentese();referenceCheckStatus();return referenceSnapshot();
        },
        async saveWindows(rows,removed=[]) {
            referenceRequireAdmin();for(const row of rows)if(!/^\d{4}-\d{2}-\d{2}$/.test(row.work_date)||!row.start_time||!row.end_time||row.end_time<=row.start_time||!Number.isInteger(Number(row.slot_step_minutes))||Number(row.slot_step_minutes)<=0)throw new Error('Adj meg érvényes dátumot, kezdést, véget és pozitív egész lépésközt.');
            for(const row of rows){const {error}=await allapot.kliens.from('availability_windows').upsert({id:row.id,work_date:row.work_date,start_time:row.start_time,end_time:row.end_time,slot_step_minutes:row.slot_step_minutes || 30,active:row.active!==false},{onConflict:'id'});if(error)throw new Error('Az egyik dátumos beosztás nem menthető.');}
            for(const id of removed){const {error}=await allapot.kliens.from('availability_windows').delete().eq('id',id);if(error)throw new Error('Az egyik beosztás törlése nem sikerült.');}
            await idosavokBetoltese();return referenceSnapshot();
        },
        async savePhone(visible){referenceRequireAdmin();adminElemek().telefonLathato.checked=visible;await beallitasokMentese();referenceCheckStatus();return referenceSnapshot();},
        async saveContent(content){referenceRequireAdmin();window.LumiAdminCms.setData(content);await window.LumiAdminCms.save();referenceCheckCms();return referenceSnapshot();},
        async upload(path,file){referenceRequireAdmin();await window.LumiAdminCms.upload(path,file);referenceCheckCms();return referenceSnapshot();},
        exportBookings(ids){referenceRequireAdmin();allapot.referenceExportBookings=(ids||referenceSnapshot().bookings.map(row=>row.id)).map(id=>{const item=referenceItem(id);return {...item.adat,__tipus:item.tipus};});try{document.querySelector('[data-admin-export="foglalasok"]')?.click();}finally{allapot.referenceExportBookings=null;}},
        async emailTest(){referenceRequireAdmin();await emailTesztekKuldese();referenceCheckStatus();},
        async acknowledgeEmailErrors(){referenceRequireAdmin();await adminV2EmailHibakNyugtazasa({disabled:false,isConnected:false});referenceCheckStatus();return referenceSnapshot();},
        async acknowledgeCancellations(){referenceRequireAdmin();await vendegLemondasokTudomasulvetele();referenceCheckStatus();return referenceSnapshot();},
        exportEvents(ids){referenceRequireAdmin();allapot.referenceExportEvents=(allapot.esemenynaploElemek||[]).filter(row=>!ids||ids.includes(row.id));try{document.querySelector('[data-admin-export="esemenyek"]')?.click();}finally{allapot.referenceExportEvents=null;}},
        async changePassword(password,repeat){referenceRequireAdmin();const e=adminElemek();e.ujJelszo.value=password;e.ujJelszoIsmet.value=repeat;try{await jelszoModositasa();const status=document.getElementById('admin-jelszo-status');if(status?.classList.contains('hiba'))throw new Error(status.textContent);}finally{e.ujJelszo.value='';e.ujJelszoIsmet.value='';}},
        calculatorChange(action,value){referenceRequireAdmin();
            if(action==='service'){arKalkulatorAllapot.szolgaltatasId=value;arKalkulatorAllapot.alapAr=arKalkulatorElsoAr(arKalkulatorAktivSzolgaltatas());}
            if(action==='base')arKalkulatorAllapot.alapAr=Number(value)||0;
            if(action==='coupon')arKalkulatorAllapot.kuponId=value;
            if(action==='reset')arKalkulatorUjrainditasa();
            if(action==='toggle'){const row=arKalkulatorDiszitesek().find(row=>String(row.id)===value);if(arKalkulatorAllapot.extrak.has(value))arKalkulatorAllapot.extrak.delete(value);else if(row)arKalkulatorAllapot.extrak.set(value,{szolgaltatas:row,darab:1,ar:arKalkulatorElsoAr(row)});}
            if(action==='extra'){const row=arKalkulatorAllapot.extrak.get(value.id);if(row){if(value.count!==undefined)row.darab=Math.min(99,Math.max(1,Number(value.count)||1));if(value.price!==undefined)row.ar=Number(value.price)||0;}}
            arKalkulatorRenderelese();return referenceSnapshot();
        },
        publication(action){return window.lumiPublikusHtmlFrissitesKerese?.('reference_admin',action);}
    };
