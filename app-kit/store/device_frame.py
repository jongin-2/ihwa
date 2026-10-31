# ⚠️ 공용 원본 — ihwa-site/app-kit/store/device_frame.py. 앱 저장소에는 글자 그대로 복사해 둔다(impl/scripts/store/device_frame.py, 고치려면 원본을 고치고 앱마다 다시 복사).
# 스토어 스크린샷(1320×2868) 한 장 안의 기기 틀 — 모든 앱이 같은 크기·위치를 쓴다(10-31 종인님 "모든 앱 같은 틀로").
#   계기: 앱마다 틀을 따로 그려 바깥 폭이 900·928·932·1008로 달랐고, content-box 테두리 때문에 응원석·한배·알롱은 14px 오른쪽으로 치우쳤다.
#  · 값: 화면 900×1956, 틀 두께 14, 바깥 928×1984, 위 740, 한가운데(왼쪽 196 = 오른쪽 196), 화면 모서리 86·바깥 100.
#  · 앱마다 다른 것은 틀 색(color)과 그림자(shadow)뿐. 위 문구 띠는 top 150·높이 350~400(10-30 기준, 앱 디자인대로).
#  · 표지처럼 화면 위에 다른 것을 겹치려면 inner에 HTML을 넘긴다(화면 900×1956 안 좌표, 넘치는 것은 잘림).
# 쓰는 법: from device_frame import frame; h += frame(x, img_src, '#0A0F1F')   # x = 그 장의 왼쪽 끝(파노라마면 k*1320)
# 검사: 렌더한 PNG는 공용 check-store-shots.py로 좌우 여백·틀 크기를 픽셀로 잰다(업로드 전 필수).

W, H = 1320, 2868
SCREEN_W, BEZEL, TOP = 900, 14, 740
SCREEN_H = round(SCREEN_W * H / W)          # 1956
OUTER_W, OUTER_H = SCREEN_W + 2 * BEZEL, SCREEN_H + 2 * BEZEL   # 928 × 1984
LEFT = (W - OUTER_W) // 2                   # 196
RADIUS = 86


def frame(x, src, color, shadow='0 30px 80px rgba(0,0,0,.4)', inner='', island=True):
    """기기 틀 HTML. src = 화면 PNG(data URI·파일 주소), color = 틀 색."""
    isl = (f'<div style="position:absolute;left:{SCREEN_W // 2 - 125}px;top:24px;width:250px;height:74px;'
           f'border-radius:37px;background:#000"></div>') if island else ''
    return (f'<div style="position:absolute;left:{x + LEFT}px;top:{TOP}px;width:{OUTER_W}px;height:{OUTER_H}px;'
            f'box-sizing:border-box;border:{BEZEL}px solid {color};border-radius:{RADIUS + BEZEL}px;background:{color};'
            f'box-shadow:{shadow};overflow:hidden">'
            f'<div style="position:relative;width:{SCREEN_W}px;height:{SCREEN_H}px;border-radius:{RADIUS}px;overflow:hidden;background:#000">'
            f'<img src="{src}" style="display:block;width:{SCREEN_W}px;height:{SCREEN_H}px">{inner}{isl}</div></div>')
