/*  (C) 2025, ALNON Industrie
Licensed under the MIT License
*/

function arcdot(colors, angle=0.5, aspect_ratio=0.3, margin=.1, minscale=2, width='100%',  angle_start=(0.25-0.5*angle)) {
    /* We treat the arch diagram as a disc with area = (scale**2)*(pi*angle)*(1 - aspect_ratio**2), we try to fit in UNIT squares (of area 1).
       We solve for scale: scale = sqrt(area/(pi*angle*(1 - aspect_ratio**2))) = sqrt(area)*sqrt(1/(pi*angle*(1 - aspect_ratio**2)))
    */
    const SEATS = colors.length;
    const ANGLE = angle; // Fraction of full circle (0.5 = semicircle)
    const ARCDOT_ASPECT_RATIO = aspect_ratio;
    const OFFSET = angle_start;
    const R_MARGIN = 1 - margin;
    const MAGIC = Math.sqrt(Math.PI * ANGLE * (1 - ARCDOT_ASPECT_RATIO**2));
    const VB_RES = 256; // A power of 2 eliminates floating point errors.
    const cx = VB_RES * 0.5;
    const cy = VB_RES * 0.5;
    
    const scale = Math.max(minscale, 2/MAGIC*Math.sqrt(SEATS)); // This roughly controls how many seats per row we expect. I have no idea why there is a 2 in here, it is a magic number I dreamed up of late at night to make it all work.
    if (scale <= 0) {
        throw new Error('Invalid Parameters');
    }
    const lower = ANGLE < 0.5 ? 0.5 * VB_RES + 0.25*VB_RES/scale : 0.5*VB_RES*(1 - Math.cos(Math.PI * ANGLE)) + 0.25*VB_RES/scale;
    let svg = '';
    svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_RES} ${lower.toFixed(1)}" width=${width} fill="none">`;

    // Build the rows
    let rows = [0]; // Don't ask why this purges tiny rows, it just does.
    let s = 0;
    while (s < SEATS) {
        // Side lengths of shape. Inner arc: 2*pi*aspect_ratio*angle*scale. Radius increment: 1 =  (by the 2*RADIUS of the unit square/circle). Circumfrence increment: pi*angle
        let n = Math.floor(Math.PI*ANGLE*(ARCDOT_ASPECT_RATIO*scale + 2*rows.length));
        rows.push(n);
        s += n;
    }
    //console.log(s);
    
    let rowcount = rows.length;
    const lane = 0.25*VB_RES/scale;
    const dot = R_MARGIN*lane;
    
    if (SEATS === 1) {
        rows = [1];
        rowcount = 1;
    }
    else {
        let oldrows = rows.slice(0);
        
        // TODO: Change this handling.
        for (let i = 0; i < (s - SEATS); i++) {
            let index = rowcount-1;
            let max = 0;
            for (let j = index; 0 <= j; j--) {
              if (rows[j] === 1 && max <= 0.5) {
                max = 0.5
                index = j;
              }
              else if (max <= (rows[j] - 1)/(oldrows[j] - 1) && rows[j] != 0) {
                max = (rows[j] - 1)/(oldrows[j] - 1);
                index = j;
              }
            }
            rows[index]--;
        }
    }
    
    let r_filled = new Uint32Array(rowcount);
    let r_thetas = new Float32Array(rowcount);
    
    for (s = 0; s < SEATS; s++) {
        let min = 2;
        let r;
        // Tiny stupid filling logic bug we fix by filling from outside in before half before swithing to inside out fill logic.
        if (s + 1 < SEATS/2) {
             r = 0;
            for (let i = 0; i < rowcount; i++) {
                if (r_thetas[i] <= min && rows[i] > 1) {
                    min = r_thetas[i];
                    r = i;
                } else if (rows[i] === 1 && 0.5 <= min && r_thetas[i] === 0) {
                    min = 0.5;
                    r = i;
                }
            }
        } else {
            r = rowcount - 1;
            for (let i = r; 0 <= i; i--) {
                if (r_thetas[i] <= min && rows[i] > 1) {
                    min = r_thetas[i];
                    r = i;
                } else if (rows[i] === 1 && 0.5 <= min && r_thetas[i] === 0) {
                    min = 0.5;
                    r = i;
                }
            }
        }
        
        r_filled[r] += 1;
        if (ANGLE === 1) {
            r_thetas[r] = r_filled[r]/(rows[r]);
        } else {
            r_thetas[r] = r_filled[r]/(rows[r]-1); // Fortunately 1/0 = infinity in js.
        }
        // From right (0) to left (pi)
        // Offset: 0.5*(1 - ANGLE)
        // We scale down by 4.
        let x = cx + (0.25*VB_RES*ARCDOT_ASPECT_RATIO + 2*r*lane) * Math.cos(2*Math.PI*(ANGLE * min + OFFSET));
        let y = cy - (0.25*VB_RES*ARCDOT_ASPECT_RATIO + 2*r*lane) * Math.sin(2*Math.PI*(ANGLE * min + OFFSET));
        //svg += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${dot.toFixed(2)}" fill="#${s.toString(16).padStart(4, '0')}ff" />`; // Test Version
        svg += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${dot.toFixed(3)}" fill="${colors[SEATS-s-1]}" />`;
    }
    svg += '</svg>';
    return svg;
}
