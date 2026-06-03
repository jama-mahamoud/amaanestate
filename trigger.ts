const trigger = async () => {
    try {
      const res = await fetch('https://formsubmit.co/b65456d54379959a0d4af14c9ba036ae', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://ais-dev-lmppa4g25qlh4dmpkqrps4-294071819485.us-east1.run.app',
          'Referer': 'https://ais-dev-lmppa4g25qlh4dmpkqrps4-294071819485.us-east1.run.app/'
        },
        body: JSON.stringify({ name: 'System', message: 'Activation trigger' })
      });
      const data = await res.text();
      console.log('Status:', res.status);
      console.log('Result:', data);
    } catch (e) {
      console.error(e);
    }
}
trigger();
