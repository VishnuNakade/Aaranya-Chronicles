const vertexSource = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentSource = `
precision mediump float;
uniform sampler2D picture;
uniform vec2 cropScale;
uniform vec2 cropOffset;
uniform float time;
varying vec2 uv;
float region(vec2 p, vec4 box) {
  vec2 a = smoothstep(box.xy, box.xy + vec2(0.008), p);
  vec2 b = 1.0 - smoothstep(box.zw - vec2(0.008), box.zw, p);
  return a.x * a.y * b.x * b.y;
}
void main() {
  vec2 p = vec2(uv.x, 1.0 - uv.y) * cropScale + cropOffset;
  vec3 original = texture2D(picture, p).rgb;
  float falls = max(region(p, vec4(0.686, 0.365, 0.772, 0.449)),
    max(region(p, vec4(0.535, 0.595, 0.627, 0.705)),
    max(region(p, vec4(0.414, 0.344, 0.439, 0.405)), region(p, vec4(0.611, 0.330, 0.657, 0.392)))));
  // Restrict motion to pale water, leaving the bridge, cliffs and trees still.
  falls *= smoothstep(0.40, 0.75, original.b) * smoothstep(-0.04, 0.08, original.b - original.r);
  float river = region(p, vec4(0.562, 0.705, 0.721, 0.938));
  river *= smoothstep(0.03, 0.15, original.b - original.r);
  float scarf = region(p, vec4(0.807, 0.486, 0.877, 0.553));
  float looseEnd = smoothstep(0.805, 0.87, p.x);
  vec2 samplePoint = p;
  samplePoint.y -= falls * (0.0016 * sin(p.y * 290.0 - time * 3.0) + 0.0006 * sin(p.x * 440.0 - time * 2.0));
  samplePoint.x += river * 0.0015 * sin(p.y * 220.0 - time * 1.4);
  samplePoint.y += scarf * looseEnd * 0.0035 * sin(time * 2.0 - p.x * 65.0);
  samplePoint.x += scarf * looseEnd * 0.0009 * sin(time * 1.5 - p.y * 55.0);
  vec3 color = texture2D(picture, samplePoint).rgb;
  float flow = sin(p.y * 360.0 - time * 4.5 + sin(p.x * 470.0)) * 0.035;
  color += vec3(flow * falls + 0.012 * river * sin(p.y * 260.0 - time * 1.8));
  gl_FragColor = vec4(color, 1.0);
}
`;

export function createMenuBackground(canvas, image, positionY = 0.54, positionX = 0.5) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const shaders = [];
  let program, buffer, texture;
  const destroy = () => {
    if (texture) gl.deleteTexture(texture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
  try {
    const compile = (type, source) => {
      const shader = gl.createShader(type); shaders.push(shader);
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    const scaleUniform = gl.getUniformLocation(program, 'cropScale');
    const offsetUniform = gl.getUniformLocation(program, 'cropOffset');
    const timeUniform = gl.getUniformLocation(program, 'time');
    return {
      resize(width, height, px = positionX, py = positionY) {
        const resolution = Math.min(1, 1440 / width, 900 / height);
        canvas.width = Math.max(1, Math.round(width * resolution));
        canvas.height = Math.max(1, Math.round(height * resolution));
        gl.viewport(0, 0, canvas.width, canvas.height);
        const cover = Math.max(width / image.width, height / image.height);
        const sx = width / (image.width * cover), sy = height / (image.height * cover);
        gl.uniform2f(scaleUniform, sx, sy);
        gl.uniform2f(offsetUniform, (1 - sx) * px, (1 - sy) * py);
      },
      draw(seconds) { gl.uniform1f(timeUniform, seconds); gl.drawArrays(gl.TRIANGLES, 0, 6); },
      destroy,
    };
  } catch {
    destroy();
    return null;
  }
}
