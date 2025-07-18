const mysql = require('mysql2/promise');

async function cleanupUmbrellas() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'umbrella_rental',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    console.log('🔍 Checking current umbrellas...');
    
    // Get all current umbrellas
    const [umbrellas] = await connection.execute(
      'SELECT id, description, location, status, inventory FROM umbrellas ORDER BY location, description'
    );
    
    console.log('Current umbrellas:', umbrellas);
    
    // Find umbrellas to keep (Station 1, 2, 3)
    const umbrellasToKeep = umbrellas.filter(umbrella => 
      umbrella.description === 'Station 1' || 
      umbrella.description === 'Station 2' || 
      umbrella.description === 'Station 3'
    );
    
    const umbrellasToDelete = umbrellas.filter(umbrella => 
      umbrella.description !== 'Station 1' && 
      umbrella.description !== 'Station 2' && 
      umbrella.description !== 'Station 3'
    );
    
    console.log('✅ Umbrellas to keep:', umbrellasToKeep.map(u => u.description));
    console.log('🗑️ Umbrellas to delete:', umbrellasToDelete.map(u => u.description));
    
    if (umbrellasToDelete.length > 0) {
      // Delete extra umbrellas
      const placeholders = umbrellasToDelete.map(() => '?').join(',');
      await connection.execute(
        `DELETE FROM umbrellas WHERE id IN (${placeholders})`,
        umbrellasToDelete.map(u => u.id)
      );
      
      console.log(`✅ Deleted ${umbrellasToDelete.length} extra umbrellas`);
    } else {
      console.log('✅ No extra umbrellas to delete');
    }
    
    // Show final result
    const [finalUmbrellas] = await connection.execute(
      'SELECT id, description, location, status, inventory FROM umbrellas ORDER BY description'
    );
    
    console.log('🎉 Final umbrellas:', finalUmbrellas);
    console.log(`📊 Total umbrellas: ${finalUmbrellas.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

cleanupUmbrellas(); 