// Only public, build-produced data. Personal/account/booking requests bypass this cache.
let lumiPublicSnapshotPromise = null;

function lumiPublicSnapshotBetoltese() {
    if (!lumiPublicSnapshotPromise) {
        lumiPublicSnapshotPromise = fetch('/adatok.json', { cache: 'no-cache', credentials: 'omit' })
            .then(response => {
                if (!response.ok) throw new Error('public_snapshot_unavailable');
                return response.json();
            })
            .then(snapshot => {
                if (snapshot.schemaVersion !== 1 || !snapshot.siteContent || !Array.isArray(snapshot.services)) {
                    throw new Error('public_snapshot_invalid');
                }
                return snapshot;
            })
            .catch(() => null);
    }
    return lumiPublicSnapshotPromise;
}

window.lumiPublicSnapshotBetoltese = lumiPublicSnapshotBetoltese;
